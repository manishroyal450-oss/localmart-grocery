import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { CafeAdminOrder, CafeOrderStatus } from '../types';
import { FIXED_PIN_CODE, extractIndianTenDigits } from './authService';

// Synchronized verbatim with firebase-blueprint.json & firestore.rules
export const BLUEPRINT_LIMITS = {
  ORDER_ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  ORDER_ID_MAX: 64,
  UID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  UID_MAX: 128,
  GMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
  EMAIL_MAX: 150,
  PHONE_PATTERN: /^\+91 [0-9]{10}$/,
  PIN_PATTERN: /^246725$/,
  DATE_KEY_PATTERN: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
  NAME_MAX: 100,
  ADDRESS_MAX: 400,
  SUMMARY_MAX: 1000,
  NOTES_MAX: 300,
  ITEMS_MAX: 50,
  ITEM_NAME_MAX: 150,
  VARIANT_MAX: 60,
} as const;

function timestampToIso(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string' && val.trim()) {
    return val;
  }
  return new Date().toISOString();
}

function normalizePhoneStrict(rawPhone: string): string | null {
  const digits = extractIndianTenDigits(rawPhone || '');
  if (digits.length !== 10) return null;
  const formatted = `+91 ${digits}`;
  return BLUEPRINT_LIMITS.PHONE_PATTERN.test(formatted) ? formatted : null;
}

export async function syncUserProfileToFirestore(
  firebaseUser: User,
  profile: {
    fullName: string;
    email: string;
    contactNumber: string;
    address: string;
    pinCode?: string;
  }
): Promise<{ synced: boolean; reason?: string }> {
  if (!firebaseUser?.uid || !firebaseUser.emailVerified) {
    return { synced: false, reason: 'Google sign-in required for Firestore sync.' };
  }

  const uid = firebaseUser.uid.trim();
  const displayName = (profile.fullName || firebaseUser.displayName || 'Customer')
    .trim()
    .slice(0, BLUEPRINT_LIMITS.NAME_MAX);
  const email = (profile.email || firebaseUser.email || '').trim().toLowerCase().slice(0, BLUEPRINT_LIMITS.EMAIL_MAX);
  const contactNumber = normalizePhoneStrict(profile.contactNumber);
  const address = (profile.address || '').trim().slice(0, BLUEPRINT_LIMITS.ADDRESS_MAX);
  const pinCode = (profile.pinCode || FIXED_PIN_CODE).trim();

  if (!BLUEPRINT_LIMITS.UID_PATTERN.test(uid) || uid.length > BLUEPRINT_LIMITS.UID_MAX) {
    return { synced: false, reason: 'Invalid user ID.' };
  }
  if (!BLUEPRINT_LIMITS.GMAIL_PATTERN.test(email)) {
    return { synced: false, reason: 'Email must end with @gmail.com.' };
  }
  if (!contactNumber) {
    return { synced: false, reason: 'Valid +91 10-digit mobile required.' };
  }
  if (!address) {
    return { synced: false, reason: 'Delivery address required.' };
  }
  if (!BLUEPRINT_LIMITS.PIN_PATTERN.test(pinCode)) {
    return { synced: false, reason: `PIN must be ${FIXED_PIN_CODE}.` };
  }

  const publicPath = `users/${uid}`;
  const publicRef = doc(db, 'users', uid);

  try {
    const publicSnap = await getDoc(publicRef);
    if (!publicSnap.exists()) {
      await setDoc(publicRef, {
        uid,
        displayName,
        pinCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(publicRef, {
        displayName,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, publicPath);
  }

  const privatePath = `users/${uid}/private/contact`;
  const privateRef = doc(db, 'users', uid, 'private', 'contact');

  try {
    const privateSnap = await getDoc(privateRef);
    if (!privateSnap.exists()) {
      await setDoc(privateRef, {
        uid,
        email,
        contactNumber,
        address,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(privateRef, {
        email,
        contactNumber,
        address,
        updatedAt: serverTimestamp(),
      });
    }
    return { synced: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, privatePath);
  }
}

export async function fetchUserProfileFromFirestore(firebaseUser: User): Promise<{
  fullName: string;
  email: string;
  contactNumber: string;
  address: string;
  pinCode: string;
} | null> {
  if (!firebaseUser?.uid || !firebaseUser.emailVerified) return null;

  const uid = firebaseUser.uid;
  const publicPath = `users/${uid}`;
  const privatePath = `users/${uid}/private/contact`;

  try {
    const publicSnap = await getDoc(doc(db, 'users', uid));
    if (!publicSnap.exists()) return null;

    const privateSnap = await getDoc(doc(db, 'users', uid, 'private', 'contact'));
    if (!privateSnap.exists()) return null;

    const pubData = publicSnap.data();
    const privData = privateSnap.data();

    return {
      fullName: String(pubData.displayName || firebaseUser.displayName || ''),
      email: String(privData.email || firebaseUser.email || ''),
      contactNumber: String(privData.contactNumber || ''),
      address: String(privData.address || ''),
      pinCode: String(pubData.pinCode || FIXED_PIN_CODE),
    };
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.GET,
      `${publicPath} / ${privatePath}`
    );
  }
}

export async function saveCafeOrderToFirestore(
  order: CafeAdminOrder,
  firebaseUser: User | null
): Promise<{ saved: boolean; reason?: string }> {
  if (!firebaseUser?.uid || !firebaseUser.emailVerified) {
    return { saved: false, reason: 'Not signed in with Google Firebase.' };
  }

  const orderId = (order.orderId || '').trim().slice(0, BLUEPRINT_LIMITS.ORDER_ID_MAX);
  const firebaseUid = firebaseUser.uid.trim();
  const customerEmail = (order.customerEmail || firebaseUser.email || '')
    .trim()
    .toLowerCase()
    .slice(0, BLUEPRINT_LIMITS.EMAIL_MAX);
  const customerName = (order.customerName || firebaseUser.displayName || 'Guest')
    .trim()
    .slice(0, BLUEPRINT_LIMITS.NAME_MAX);
  const customerPhone = normalizePhoneStrict(order.customerPhone || '');

  if (!BLUEPRINT_LIMITS.ORDER_ID_PATTERN.test(orderId) || orderId.length < 3) {
    return { saved: false, reason: 'Invalid orderId format.' };
  }
  if (!BLUEPRINT_LIMITS.UID_PATTERN.test(firebaseUid) || firebaseUid.length > BLUEPRINT_LIMITS.UID_MAX) {
    return { saved: false, reason: 'Invalid Firebase UID.' };
  }
  if (!BLUEPRINT_LIMITS.GMAIL_PATTERN.test(customerEmail)) {
    return { saved: false, reason: 'Customer email must end with @gmail.com.' };
  }
  if (!customerPhone) {
    return { saved: false, reason: 'Valid +91 10-digit Indian phone number required.' };
  }

  const sanitizedItems = (order.items || [])
    .slice(0, BLUEPRINT_LIMITS.ITEMS_MAX)
    .map((it) => ({
      name: String(it.name || 'Item').trim().slice(0, BLUEPRINT_LIMITS.ITEM_NAME_MAX) || 'Item',
      variant: String(it.variant || 'Standard').trim().slice(0, BLUEPRINT_LIMITS.VARIANT_MAX) || 'Standard',
      qty: Math.min(100, Math.max(1, Number(it.qty) || 1)),
      price: Math.min(100000, Math.max(0, Number(it.price) || 0)),
      total: Math.min(1000000, Math.max(0, Number(it.total) || 0)),
    }));

  if (sanitizedItems.length === 0) {
    return { saved: false, reason: 'At least one item is required.' };
  }

  const itemSummary =
    (order.itemSummary ||
      sanitizedItems
        .map((it) =>
          it.variant !== 'Standard' ? `${it.name} (${it.variant}) x ${it.qty}` : `${it.name} x ${it.qty}`
        )
        .join(', '))
      .trim()
      .slice(0, BLUEPRINT_LIMITS.SUMMARY_MAX) || 'Order Item';

  const dateKey = BLUEPRINT_LIMITS.DATE_KEY_PATTERN.test(order.dateKey || '')
    ? order.dateKey
    : new Date().toISOString().slice(0, 10);

  const docData = {
    orderId,
    firebaseUid,
    profileId: String(order.userId || firebaseUid).trim().slice(0, BLUEPRINT_LIMITS.UID_MAX),
    customerEmail,
    customerName,
    customerPhone,
    orderType:
      order.orderType === 'delivery' || order.orderType === 'takeaway'
        ? order.orderType
        : 'dine-in',
    tableOrAddress: String(order.tableOrAddress || '').trim().slice(0, BLUEPRINT_LIMITS.ADDRESS_MAX),
    items: sanitizedItems,
    itemSummary,
    subtotal: Math.min(1000000, Math.max(0, Number(order.subtotal) || 0)),
    deliveryFee: Math.min(50000, Math.max(0, Number(order.deliveryFee) || 0)),
    grandTotal: Math.min(1050000, Math.max(0, Number(order.grandTotal) || 0)),
    status: 'pending' as const,
    dateKey,
    notes: String(order.notes || '').trim().slice(0, BLUEPRINT_LIMITS.NOTES_MAX),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docPath = `cafeOrders/${orderId}`;
  try {
    await setDoc(doc(db, 'cafeOrders', orderId), docData);
    return { saved: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

function mapDocToCafeOrder(data: Record<string, any>): CafeAdminOrder {
  return {
    orderId: String(data.orderId || ''),
    userId: String(data.profileId || ''),
    firebaseUid: String(data.firebaseUid || ''),
    customerEmail: String(data.customerEmail || ''),
    customerName: String(data.customerName || 'Guest'),
    customerPhone: String(data.customerPhone || ''),
    orderType:
      data.orderType === 'delivery' || data.orderType === 'takeaway'
        ? data.orderType
        : 'dine-in',
    tableOrAddress: String(data.tableOrAddress || ''),
    items: Array.isArray(data.items) ? data.items : [],
    itemSummary: String(data.itemSummary || ''),
    subtotal: Number(data.subtotal || 0),
    deliveryFee: Number(data.deliveryFee || 0),
    grandTotal: Number(data.grandTotal || 0),
    status: data.status === 'confirmed' ? 'confirmed' : 'pending',
    createdAt: timestampToIso(data.createdAt),
    dateKey: String(data.dateKey || ''),
    notes: String(data.notes || ''),
    syncedToFirestore: true,
  };
}

export function subscribeToCustomerOrdersFirestore(
  firebaseUid: string,
  onOrders: (orders: CafeAdminOrder[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'cafeOrders';
  const q = query(collection(db, path), where('firebaseUid', '==', firebaseUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs
        .map((d) => mapDocToCafeOrder(d.data()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onOrders(orders);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export function subscribeToAdminOrdersFirestore(
  onOrders: (orders: CafeAdminOrder[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'cafeOrders';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => mapDocToCafeOrder(d.data()));
      onOrders(orders);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function updateCafeOrderStatusInFirestore(
  orderId: string,
  status: CafeOrderStatus
): Promise<{ updatedInFirestore: boolean }> {
  const docPath = `cafeOrders/${orderId}`;
  const ref = doc(db, 'cafeOrders', orderId);

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { updatedInFirestore: false };
    }
    await updateDoc(ref, {
      status,
      updatedAt: serverTimestamp(),
    });
    return { updatedInFirestore: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteCafeOrderFromFirestore(
  orderId: string
): Promise<{ deletedFromFirestore: boolean }> {
  const cleanId = (orderId || '').trim();
  if (!BLUEPRINT_LIMITS.ORDER_ID_PATTERN.test(cleanId) || cleanId.length > BLUEPRINT_LIMITS.ORDER_ID_MAX) {
    return { deletedFromFirestore: false };
  }

  const docPath = `cafeOrders/${cleanId}`;
  const ref = doc(db, 'cafeOrders', cleanId);

  try {
    await deleteDoc(ref);
    return { deletedFromFirestore: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function clearCafeOrdersFromFirestore(
  dateKey?: string
): Promise<{ deletedCount: number }> {
  const colRef = collection(db, 'cafeOrders');
  const q = dateKey ? query(colRef, where('dateKey', '==', dateKey)) : colRef;

  try {
    const snap = await getDocs(q);
    if (snap.empty) {
      return { deletedCount: 0 };
    }

    const docs = snap.docs;
    const BATCH_LIMIT = 450;
    for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
      const chunk = docs.slice(i, i + BATCH_LIMIT);
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    return { deletedCount: docs.length };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'cafeOrders');
  }
}
