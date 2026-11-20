import {
  CafeAdminOrder,
  CafeOrderStatus,
  SheetOrderLogEntry,
  SheetSalesSummary,
} from '../types';
import { GOOGLE_SHEET_ENDPOINT } from './menuService';
import { UserProfile, extractIndianTenDigits } from './authService';
import {
  clearCafeOrdersFromFirestore,
  deleteCafeOrderFromFirestore,
  updateCafeOrderStatusInFirestore,
} from './firestoreOrdersService';

const CAFE_ORDERS_STORAGE_KEY = 'friends4ever_cafe_orders_v1';
export const CAFE_ORDERS_UPDATED_EVENT = 'cafe-orders-updated';

export function getTodayDateKey(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function loadLocalCafeOrders(): CafeAdminOrder[] {
  try {
    const raw = localStorage.getItem(CAFE_ORDERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalCafeOrders(orders: CafeAdminOrder[]): void {
  try {
    localStorage.setItem(CAFE_ORDERS_STORAGE_KEY, JSON.stringify(orders));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CAFE_ORDERS_UPDATED_EVENT));
    }
  } catch (err) {
    console.warn('Failed to save cafe orders locally:', err);
  }
}

export function mergeOrdersLists(
  baseOrders: CafeAdminOrder[],
  incomingOrders: CafeAdminOrder[]
): CafeAdminOrder[] {
  const map = new Map<string, CafeAdminOrder>();
  for (const order of baseOrders) {
    map.set(order.orderId, order);
  }
  for (const order of incomingOrders) {
    const prev = map.get(order.orderId);
    if (!prev) {
      map.set(order.orderId, order);
    } else {
      map.set(order.orderId, {
        ...prev,
        ...order,
      });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function markOrderSyncedToFirestore(orderId: string, firebaseUid?: string): void {
  const existing = loadLocalCafeOrders();
  const updated = existing.map((o) =>
    o.orderId === orderId
      ? { ...o, syncedToFirestore: true, firebaseUid: firebaseUid || o.firebaseUid }
      : o
  );
  saveLocalCafeOrders(updated);
}

export function doesOrderBelongToUser(
  order: CafeAdminOrder,
  user: UserProfile | null,
  firebaseUid?: string | null
): boolean {
  if (!user && !firebaseUid) return false;

  const orderFirebaseUid = (order.firebaseUid || '').trim();
  if (firebaseUid && orderFirebaseUid && orderFirebaseUid === firebaseUid) {
    return true;
  }

  if (!user) return false;

  const orderUserId = (order.userId || '').trim();
  const orderEmail = (order.customerEmail || '').trim().toLowerCase();
  const userEmail = (user.email || '').trim().toLowerCase();

  // Strictly match by userId or customerEmail when order carries profile identity
  if (orderUserId || orderEmail) {
    if (orderUserId && orderUserId === user.id) return true;
    if (orderEmail && userEmail && orderEmail === userEmail) return true;
    return false;
  }

  // Legacy fallback only when an older order has no userId/customerEmail: require BOTH phone & name match
  const orderPhone = extractIndianTenDigits(order.customerPhone || '');
  const userPhone = extractIndianTenDigits(user.contactNumber || '');
  const orderName = (order.customerName || '').trim().toLowerCase();
  const userName = (user.fullName || '').trim().toLowerCase();

  return Boolean(orderPhone && userPhone && orderPhone === userPhone && orderName && orderName === userName);
}

export function getLocalCustomerOrders(
  user: UserProfile | null,
  firebaseUid?: string | null
): CafeAdminOrder[] {
  if (!user && !firebaseUid) return [];
  return loadLocalCafeOrders()
    .filter((o) => doesOrderBelongToUser(o, user, firebaseUid))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function recordLocalCafeOrder(payload: {
  bill_no: string;
  user_id?: string;
  firebase_uid?: string;
  customer_email?: string;
  customer_name: string;
  customer_phone?: string;
  table_or_address?: string;
  order_type?: string;
  grandtotal: number;
  subtotal?: number;
  delivery_fee?: number;
  notes?: string;
  items: Array<{
    name: string;
    item_name?: string;
    itemname?: string;
    variant?: string;
    qty: number;
    price: number;
    total?: number;
  }>;
}): CafeAdminOrder {
  const now = new Date().toISOString();
  const existing = loadLocalCafeOrders();
  const idx = existing.findIndex((o) => o.orderId === payload.bill_no);
  const prev = idx !== -1 ? existing[idx] : undefined;

  const items = (payload.items || []).map((it) => ({
    name: it.item_name || it.name,
    variant: it.variant || 'Standard',
    qty: Number(it.qty) || 1,
    price: Number(it.price) || 0,
    total: Number(it.total ?? (Number(it.price) || 0) * (Number(it.qty) || 1)),
  }));

  const itemSummary = items
    .map((it) =>
      it.variant && it.variant !== 'Standard'
        ? `${it.name} (${it.variant}) x ${it.qty}`
        : `${it.name} x ${it.qty}`
    )
    .join(', ');

  const order: CafeAdminOrder = {
    orderId: payload.bill_no,
    userId: payload.user_id?.trim() || prev?.userId || '',
    firebaseUid: payload.firebase_uid?.trim() || prev?.firebaseUid || '',
    customerEmail: payload.customer_email?.trim().toLowerCase() || prev?.customerEmail || '',
    customerName: (payload.customer_name || 'Guest').trim(),
    customerPhone: (payload.customer_phone || '').trim(),
    orderType:
      payload.order_type === 'delivery' || payload.order_type === 'takeaway'
        ? payload.order_type
        : 'dine-in',
    tableOrAddress: (payload.table_or_address || '').trim(),
    items,
    itemSummary,
    subtotal: Number(payload.subtotal ?? payload.grandtotal ?? 0),
    deliveryFee: Number(payload.delivery_fee ?? 0),
    grandTotal: Number(payload.grandtotal ?? 0),
    status: prev ? prev.status : 'pending',
    createdAt: prev ? prev.createdAt : now,
    dateKey: prev ? prev.dateKey : getTodayDateKey(now),
    notes: payload.notes || '',
  };

  if (idx === -1) {
    existing.unshift(order);
  } else {
    existing[idx] = order;
  }

  saveLocalCafeOrders(existing);
  return order;
}

export async function fetchCafeAdminOrders(): Promise<CafeAdminOrder[]> {
  const localOrders = loadLocalCafeOrders();
  let serverOrders: CafeAdminOrder[] = [];

  try {
    const res = await fetch('/api/cafe-orders', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.orders)) {
        serverOrders = data.orders;
      }
    }
  } catch (err) {
    console.warn('Could not fetch /api/cafe-orders, using local orders:', err);
  }

  const merged = mergeOrdersLists(localOrders, serverOrders);
  saveLocalCafeOrders(merged);
  return merged;
}

export async function fetchCustomerOrders(
  user: UserProfile | null,
  firebaseUid?: string | null
): Promise<CafeAdminOrder[]> {
  if (!user && !firebaseUid) return [];

  const allLocal = loadLocalCafeOrders();
  let serverOrders: CafeAdminOrder[] = [];

  if (user) {
    try {
      const params = new URLSearchParams({
        userId: user.id,
        email: user.email,
        phone: user.contactNumber,
        name: user.fullName,
      });
      const res = await fetch(`/api/cafe-orders?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.orders)) {
          serverOrders = data.orders;
        }
      }
    } catch (err) {
      console.warn('Could not fetch customer orders from server, using local orders:', err);
    }
  }

  // Merge server updates back into allLocal without wiping other profiles' local orders
  const map = new Map<string, CafeAdminOrder>();
  for (const order of allLocal) {
    map.set(order.orderId, order);
  }
  let changed = false;
  for (const serverOrder of serverOrders) {
    const prev = map.get(serverOrder.orderId);
    if (!prev) {
      map.set(serverOrder.orderId, serverOrder);
      changed = true;
    } else if (
      prev.status !== serverOrder.status ||
      prev.userId !== serverOrder.userId ||
      prev.customerEmail !== serverOrder.customerEmail
    ) {
      map.set(serverOrder.orderId, { ...prev, ...serverOrder });
      changed = true;
    }
  }

  const allMerged = Array.from(map.values());
  if (changed) {
    try {
      localStorage.setItem(CAFE_ORDERS_STORAGE_KEY, JSON.stringify(allMerged));
    } catch {
      // ignore storage errors
    }
  }

  return allMerged
    .filter((o) => doesOrderBelongToUser(o, user, firebaseUid))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateCafeOrderStatus(
  orderId: string,
  status: CafeOrderStatus,
  isFirebaseAdmin = false
): Promise<CafeAdminOrder[]> {
  const local = loadLocalCafeOrders();
  const updatedLocal = local.map((o) =>
    o.orderId === orderId ? { ...o, status } : o
  );
  saveLocalCafeOrders(updatedLocal);

  if (isFirebaseAdmin) {
    try {
      await updateCafeOrderStatusInFirestore(orderId, status);
    } catch (err) {
      console.warn('Failed to update order status in Firestore:', err);
      throw err;
    }
  }

  try {
    await fetch(`/api/cafe-orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    console.warn('Failed to update order status on server:', err);
  }

  return updatedLocal;
}

export async function deleteCafeOrder(
  orderId: string,
  isFirebaseAdmin = false
): Promise<CafeAdminOrder[]> {
  if (isFirebaseAdmin) {
    try {
      await deleteCafeOrderFromFirestore(orderId);
    } catch (err) {
      console.warn('Failed to delete order from Firestore:', err);
      throw err;
    }
  }

  const local = loadLocalCafeOrders();
  const updatedLocal = local.filter((o) => o.orderId !== orderId);
  saveLocalCafeOrders(updatedLocal);

  try {
    await fetch(`/api/cafe-orders/${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Failed to delete order from server:', err);
  }

  return updatedLocal;
}

export async function clearCafeOrdersStorage(
  scope: 'all' | 'today',
  todayKey: string,
  isFirebaseAdmin = false
): Promise<CafeAdminOrder[]> {
  if (isFirebaseAdmin) {
    try {
      await clearCafeOrdersFromFirestore(scope === 'today' ? todayKey : undefined);
    } catch (err) {
      console.warn('Failed to clear orders from Firestore:', err);
      throw err;
    }
  }

  const local = loadLocalCafeOrders();
  const updatedLocal =
    scope === 'today' ? local.filter((o) => o.dateKey !== todayKey) : [];
  saveLocalCafeOrders(updatedLocal);

  try {
    const queryStr = scope === 'today' ? `?dateKey=${encodeURIComponent(todayKey)}` : '';
    await fetch(`/api/cafe-orders${queryStr}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Failed to clear orders on server:', err);
  }

  return updatedLocal;
}

function getCellNumericValue(cell: any): number {
  if (!cell) return 0;
  const raw = cell.v !== undefined && cell.v !== null ? cell.v : cell.f;
  if (raw === undefined || raw === null || raw === '') return 0;
  const num = Number(String(raw).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
}

function getCellTextValue(cell: any): string {
  if (!cell) return '';
  if (cell.f !== undefined && cell.f !== null) return String(cell.f).trim();
  if (cell.v !== undefined && cell.v !== null) return String(cell.v).trim();
  return '';
}

export async function fetchSheetSalesSummary(): Promise<SheetSalesSummary> {
  let rawText = '';

  try {
    const proxyRes = await fetch('/api/menu', { cache: 'no-store' });
    if (proxyRes.ok) {
      rawText = await proxyRes.text();
    }
  } catch {
    // fallback below
  }

  if (!rawText) {
    try {
      const directRes = await fetch(GOOGLE_SHEET_ENDPOINT, { cache: 'no-store' });
      if (directRes.ok) {
        rawText = await directRes.text();
      }
    } catch {
      return { sheetCustomTotal: 0, sheetGrandTotal: 0, entries: [] };
    }
  }

  try {
    const startIdx = rawText.indexOf('{');
    const endIdx = rawText.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) {
      return { sheetCustomTotal: 0, sheetGrandTotal: 0, entries: [] };
    }

    const data = JSON.parse(rawText.substring(startIdx, endIdx + 1));
    const rows: any[] = data?.table?.rows || [];

    let sheetCustomTotal = 0;
    let sheetGrandTotal = 0;
    const entries: SheetOrderLogEntry[] = [];

    rows.forEach((row, index) => {
      if (!row?.c) return;

      // Col N (13): Coustomtotal, Col O (14): Grandtotal
      const colN = getCellNumericValue(row.c[13]);
      const colO = getCellNumericValue(row.c[14]);
      if (colN > 0 && sheetCustomTotal === 0) sheetCustomTotal = colN;
      if (colO > 0 && sheetGrandTotal === 0) sheetGrandTotal = colO;

      // Col U (20): coustomer Name, Col V (21): itemname, Col W (22): price
      const customerName = getCellTextValue(row.c[20]);
      const itemName = getCellTextValue(row.c[21]);
      const price = getCellNumericValue(row.c[22]);

      const isHeader =
        customerName.toLowerCase().includes('coustomer') ||
        customerName.toLowerCase() === 'customer name' ||
        itemName.toLowerCase() === 'itemname';

      if (!isHeader && (customerName || itemName || price > 0)) {
        entries.push({
          rowNumber: index + 2,
          customerName: customerName || 'Walk-in / Sheet Entry',
          itemName: itemName || '—',
          price,
        });
      }
    });

    // If Grandtotal cell O wasn't populated but U/V/W rows have prices, sum them
    if (sheetGrandTotal === 0 && entries.length > 0) {
      sheetGrandTotal = entries.reduce((sum, e) => sum + e.price, 0);
    }

    return {
      sheetCustomTotal,
      sheetGrandTotal,
      entries,
    };
  } catch (err) {
    console.warn('Failed to parse sheet sales summary:', err);
    return { sheetCustomTotal: 0, sheetGrandTotal: 0, entries: [] };
  }
}
