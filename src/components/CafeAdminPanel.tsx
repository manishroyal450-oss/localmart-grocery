import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  RefreshCw,
  CheckCircle2,
  Clock,
  Search,
  IndianRupee,
  ShoppingBag,
  FileSpreadsheet,
  Cloud,
  LogIn,
  LogOut,
  ShieldCheck,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { CafeAdminOrder, CafeOrderStatus, SheetSalesSummary } from '../types';
import {
  CAFE_ORDERS_UPDATED_EVENT,
  clearCafeOrdersStorage,
  deleteCafeOrder,
  fetchCafeAdminOrders,
  fetchSheetSalesSummary,
  getTodayDateKey,
  mergeOrdersLists,
  updateCafeOrderStatus,
} from '../services/cafeOrderAdminService';
import { useFirebase } from '../context/FirebaseContext';
import { ADMIN_EMAIL } from '../firebase';
import { subscribeToAdminOrdersFirestore } from '../services/firestoreOrdersService';

interface CafeAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CafeAdminPanel: React.FC<CafeAdminPanelProps> = ({ isOpen, onClose }) => {
  const {
    firebaseUser,
    isAuthReady,
    isFirebaseAdmin,
    firebaseLoading,
    firebaseError,
    signInWithGoogle,
    signOutFirebase,
  } = useFirebase();

  const [localAndServerOrders, setLocalAndServerOrders] = useState<CafeAdminOrder[]>([]);
  const [firestoreOrders, setFirestoreOrders] = useState<CafeAdminOrder[]>([]);
  const [sheetSummary, setSheetSummary] = useState<SheetSalesSummary>({
    sheetCustomTotal: 0,
    sheetGrandTotal: 0,
    entries: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dateScope, setDateScope] = useState<'today' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | CafeOrderStatus>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);
  const [showClearStorageConfirm, setShowClearStorageConfirm] = useState<boolean>(false);
  const [isClearingStorage, setIsClearingStorage] = useState<boolean>(false);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [adminActionError, setAdminActionError] = useState<string | null>(null);

  const todayKey = getTodayDateKey();

  const orders = useMemo(
    () => mergeOrdersLists(localAndServerOrders, firestoreOrders),
    [localAndServerOrders, firestoreOrders]
  );

  const loadAdminData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [fetchedOrders, fetchedSheet] = await Promise.all([
        fetchCafeAdminOrders(),
        fetchSheetSalesSummary(),
      ]);
      setLocalAndServerOrders(fetchedOrders);
      setSheetSummary(fetchedSheet);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
      document.body.style.overflow = 'hidden';

      const handleSync = () => loadAdminData(true);
      window.addEventListener(CAFE_ORDERS_UPDATED_EVENT, handleSync);
      window.addEventListener('storage', handleSync);
      const pollTimer = window.setInterval(() => loadAdminData(true), 5000);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener(CAFE_ORDERS_UPDATED_EVENT, handleSync);
        window.removeEventListener('storage', handleSync);
        window.clearInterval(pollTimer);
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, loadAdminData]);

  // Real-time Firestore listener when authenticated as Firebase Admin
  useEffect(() => {
    if (!isOpen || !isAuthReady || !isFirebaseAdmin) {
      if (!isFirebaseAdmin) setFirestoreOrders([]);
      return;
    }

    const unsubscribe = subscribeToAdminOrdersFirestore(
      (fsOrders) => {
        setFirestoreOrders(fsOrders);
        setAdminActionError(null);
      },
      (err) => {
        console.warn('Admin Firestore listener warning:', err);
        const msg = err?.message || '';
        if (msg.includes('Quota exceeded') || msg.includes('resource-exhausted')) {
          setAdminActionError(
            'Firestore daily free-tier limit poori ho gayi hai. Orders local/server backup par chal rahe hain — Owner Firebase Blaze (paid) plan upgrade kar sakte hain.'
          );
        } else {
          setAdminActionError('Firestore live stream connect nahi ho saka. Local/server sync active hai.');
        }
      }
    );

    return () => unsubscribe();
  }, [isOpen, isAuthReady, isFirebaseAdmin]);

  const handleStatusChange = async (orderId: string, nextStatus: CafeOrderStatus) => {
    setUpdatingOrderId(orderId);
    setAdminActionError(null);
    try {
      const updated = await updateCafeOrderStatus(orderId, nextStatus, isFirebaseAdmin);
      setLocalAndServerOrders(updated);
      setFirestoreOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: nextStatus } : o))
      );
    } catch (err: any) {
      setAdminActionError(err?.message || 'Status update failed. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    setAdminActionError(null);
    setStorageNotice(null);
    try {
      const updated = await deleteCafeOrder(orderId, isFirebaseAdmin);
      setLocalAndServerOrders(updated);
      setFirestoreOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      setConfirmDeleteOrderId(null);
      setStorageNotice(
        isFirebaseAdmin
          ? `Order #${orderId} local, server aur Firebase storage se delete ho gaya.`
          : `Order #${orderId} local aur server storage se delete ho gaya.`
      );
    } catch (err: any) {
      setAdminActionError(err?.message || 'Order delete failed. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleClearStorage = async (scope: 'today' | 'all') => {
    setIsClearingStorage(true);
    setAdminActionError(null);
    setStorageNotice(null);
    try {
      const updated = await clearCafeOrdersStorage(scope, todayKey, isFirebaseAdmin);
      setLocalAndServerOrders(updated);
      setFirestoreOrders((prev) =>
        scope === 'today' ? prev.filter((o) => o.dateKey !== todayKey) : []
      );
      setShowClearStorageConfirm(false);
      setConfirmDeleteOrderId(null);
      setStorageNotice(
        scope === 'today'
          ? isFirebaseAdmin
            ? 'Aaj ke sabhi orders local, server aur Firebase storage se delete ho gaye.'
            : 'Aaj ke sabhi orders local aur server storage se delete ho gaye.'
          : isFirebaseAdmin
          ? 'Poora order storage (Local, Server aur Firebase) clear ho gaya.'
          : 'Poora local aur server order storage clear ho gaya.'
      );
    } catch (err: any) {
      setAdminActionError(err?.message || 'Storage clear failed. Please try again.');
    } finally {
      setIsClearingStorage(false);
    }
  };

  // Pure din (Today) & Overall metrics
  const metrics = useMemo(() => {
    const todayOrders = orders.filter((o) => o.dateKey === todayKey);
    const todayConfirmed = todayOrders.filter((o) => o.status === 'confirmed');
    const todayPending = todayOrders.filter((o) => o.status === 'pending');

    const todayGrandTotal = todayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const todayConfirmedTotal = todayConfirmed.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const todayPendingTotal = todayPending.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    const overallGrandTotal = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    return {
      todayCount: todayOrders.length,
      todayConfirmedCount: todayConfirmed.length,
      todayPendingCount: todayPending.length,
      todayGrandTotal,
      todayConfirmedTotal,
      todayPendingTotal,
      overallCount: orders.length,
      overallGrandTotal,
    };
  }, [orders, todayKey]);

  // Filtered list based on dateScope, statusFilter, and searchTerm
  const scopedOrders = useMemo(() => {
    return dateScope === 'today' ? orders.filter((o) => o.dateKey === todayKey) : orders;
  }, [orders, dateScope, todayKey]);

  const statusCounts = useMemo(() => {
    return {
      all: scopedOrders.length,
      pending: scopedOrders.filter((o) => o.status === 'pending').length,
      confirmed: scopedOrders.filter((o) => o.status === 'confirmed').length,
    };
  }, [scopedOrders]);

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return scopedOrders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.customerName.toLowerCase().includes(q) ||
        o.orderId.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.itemSummary.toLowerCase().includes(q)
      );
    });
  }, [scopedOrders, statusFilter, searchTerm]);

  if (!isOpen) return null;

  const formattedToday = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      id="cafe-admin-panel-modal"
      className="fixed inset-0 z-50 bg-stone-50 flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Friends 4 Ever Cafe Admin Panel"
    >
      {/* Top Bar */}
      <header className="bg-white border-b border-stone-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <h2 className="text-base sm:text-xl font-bold text-stone-900 tracking-tight truncate">
            Admin Panel · Friends 4 Ever Coffee Cafe
          </h2>
          <p className="text-xs text-stone-500 mt-0.5 tabular-nums">
            Daily Sales &amp; Order Confirmation · {formattedToday}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowClearStorageConfirm((prev) => !prev);
              setStorageNotice(null);
            }}
            disabled={orders.length === 0 || isClearingStorage}
            className="min-h-[40px] px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Delete Stored Orders"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Storage</span>
          </button>

          <button
            type="button"
            onClick={() => loadAdminData(false)}
            disabled={isLoading}
            className="min-h-[40px] px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            aria-label="Close Admin Panel"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Firebase Firestore Live Admin Sync Status */}
          <section
            aria-label="Firebase Firestore Sync"
            className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isFirebaseAdmin
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  isFirebaseAdmin
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {isFirebaseAdmin ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <Cloud className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                    {isFirebaseAdmin
                      ? 'Firebase Firestore Live Sync Active'
                      : 'Owner Firebase Admin Sync'}
                  </h3>
                  {isFirebaseAdmin && (
                    <span className="text-[11px] font-semibold text-emerald-700">
                      ({firebaseUser?.email})
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  {isFirebaseAdmin
                    ? `Sabhi customer orders aur Confirm/Pending updates real-time Firestore me save ho rahe hain (${firestoreOrders.length} cloud orders).`
                    : firebaseUser
                    ? `Signed in as ${firebaseUser.email}. Admin access ke liye Cafe Owner ki Google ID (${ADMIN_EMAIL}) se sign in karein.`
                    : `Sirf Cafe Owner (${ADMIN_EMAIL}) yahan sign in karein — customers apne Profile me apni Gmail ID se sign in karenge.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isFirebaseAdmin ? (
                <button
                  type="button"
                  onClick={signOutFirebase}
                  disabled={firebaseLoading}
                  className="min-h-[38px] px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              ) : (
                <>
                  {firebaseUser && (
                    <button
                      type="button"
                      onClick={signOutFirebase}
                      disabled={firebaseLoading}
                      className="min-h-[38px] px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    disabled={firebaseLoading}
                    className="min-h-[38px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{firebaseLoading ? 'Connecting...' : 'Sign in as Owner'}</span>
                  </button>
                </>
              )}
            </div>
          </section>

          {(firebaseError || adminActionError) && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-rose-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{firebaseError || adminActionError}</span>
              </div>
              {adminActionError?.includes('Blaze') && (
                <a
                  href="https://console.firebase.google.com/project/gen-lang-client-0131083392/firestore/databases/ai-studio-localmartgrocery-f779cc2e-bb7a-4aa9-aa78-740b1c4aeef5/data?openUpgradeDialog=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shrink-0 text-center"
                >
                  Upgrade Firebase Plan
                </a>
              )}
            </div>
          )}

          {storageNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs font-medium text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{storageNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setStorageNotice(null)}
                className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {showClearStorageConfirm && (
            <section
              aria-label="Clear Storage Confirmation"
              className="rounded-2xl border border-rose-200 bg-white p-4 sm:p-5 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                      Order Storage Delete Karein
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {isFirebaseAdmin
                        ? 'Delete karne par orders Local, Server DB aur Firebase Cloud teeno se permanently remove ho jayenge.'
                        : 'Abhi Local aur Server storage ke orders delete honge. Firebase Cloud orders delete karne ke liye upar Owner Sign-In karein.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClearStorageConfirm(false)}
                  className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                  aria-label="Cancel storage delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {metrics.todayCount > 0 && (
                  <button
                    type="button"
                    disabled={isClearingStorage}
                    onClick={() => handleClearStorage('today')}
                    className="min-h-[38px] px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isClearingStorage
                      ? 'Deleting...'
                      : `Delete Today's Orders (${metrics.todayCount})`}
                  </button>
                )}
                <button
                  type="button"
                  disabled={isClearingStorage || orders.length === 0}
                  onClick={() => handleClearStorage('all')}
                  className="min-h-[38px] px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isClearingStorage
                    ? 'Clearing...'
                    : `Clear All Storage (${metrics.overallCount})`}
                </button>
                <button
                  type="button"
                  disabled={isClearingStorage}
                  onClick={() => setShowClearStorageConfirm(false)}
                  className="min-h-[38px] px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </section>
          )}

          {/* 1. Overall Daily Selling Summary & Grand Total */}
          <section aria-label="Daily Selling Overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Today's Selling Orders */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs font-medium text-stone-500">
                  <span>Today&apos;s Selling Orders (Pure Din)</span>
                  <ShoppingBag className="w-4 h-4 text-rose-600" />
                </div>
                <p className="mt-2 text-3xl font-bold text-stone-900 font-mono tabular-nums">
                  {metrics.todayCount}
                </p>
                <p className="mt-2 text-xs text-stone-600 tabular-nums">
                  Confirmed: <strong className="text-emerald-700">{metrics.todayConfirmedCount}</strong>
                  <span className="mx-2 text-stone-300">|</span>
                  Pending: <strong className="text-amber-700">{metrics.todayPendingCount}</strong>
                </p>
              </div>

              {/* Today's Grand Total */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs font-medium text-stone-500">
                  <span>Today&apos;s Grand Total (Pure Din Ka)</span>
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="mt-2 text-3xl font-bold text-stone-900 font-mono tabular-nums">
                  ₹{metrics.todayGrandTotal.toLocaleString('en-IN')}
                </p>
                <p className="mt-2 text-xs text-stone-600 font-mono tabular-nums">
                  Confirmed: <strong className="text-emerald-700">₹{metrics.todayConfirmedTotal.toLocaleString('en-IN')}</strong>
                  <span className="mx-2 text-stone-300">|</span>
                  Pending: <strong className="text-amber-700">₹{metrics.todayPendingTotal.toLocaleString('en-IN')}</strong>
                </p>
              </div>

              {/* Overall Grand Total + Sheet Grandtotal */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs font-medium text-stone-500">
                  <span>Overall Selling Grand Total</span>
                  <FileSpreadsheet className="w-4 h-4 text-stone-700" />
                </div>
                <p className="mt-2 text-3xl font-bold text-rose-600 font-mono tabular-nums">
                  ₹{metrics.overallGrandTotal.toLocaleString('en-IN')}
                </p>
                <p className="mt-2 text-xs text-stone-600 tabular-nums">
                  Total Orders: <strong>{metrics.overallCount}</strong>
                  {sheetSummary.sheetGrandTotal > 0 && (
                    <>
                      <span className="mx-2 text-stone-300">·</span>
                      Sheet Total: <strong className="font-mono">₹{sheetSummary.sheetGrandTotal.toLocaleString('en-IN')}</strong>
                    </>
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* 2. Customer Name & Order Status Management (Confirmed / Pending) */}
          <section className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Customer Orders &amp; Status
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Customer Name ke saath order confirmation ya pending status manage karein
                  </p>
                </div>

                {/* Date Scope Toggle */}
                <div className="inline-flex items-center p-1 bg-stone-100 rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setDateScope('today')}
                    className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      dateScope === 'today'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Today ({metrics.todayCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateScope('all')}
                    className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      dateScope === 'all'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    All Orders ({metrics.overallCount})
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="inline-flex items-center gap-1 p-1 bg-stone-100 rounded-xl self-start">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    All ({statusCounts.all})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('pending')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      statusFilter === 'pending'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Pending ({statusCounts.pending})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('confirmed')}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      statusFilter === 'confirmed'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Confirmed ({statusCounts.confirmed})
                  </button>
                </div>

                {/* Customer Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search customer name, phone, order..."
                    className="w-full min-h-[40px] pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <p className="text-sm font-semibold text-stone-800">
                  No orders found for this selection
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Jab bhi customer WhatsApp se order karega, uska naam, items, price aur pending/confirmed status yahan dikhega.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Order &amp; Time</th>
                        <th className="py-3 px-4">Customer Name</th>
                        <th className="py-3 px-4">Items Ordered</th>
                        <th className="py-3 px-4 text-right">Grand Total</th>
                        <th className="py-3 px-4">Order Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs">
                      {filteredOrders.map((order) => {
                        const isConfirmed = order.status === 'confirmed';
                        const isBusy = updatingOrderId === order.orderId;
                        return (
                          <tr key={order.orderId} className="hover:bg-stone-50/60 transition-colors">
                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <p className="font-mono font-semibold text-stone-900">
                                #{order.orderId}
                              </p>
                              <p className="text-[11px] text-stone-500 mt-0.5 tabular-nums">
                                {formatTime(order.createdAt)} · {order.orderType}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 align-top">
                              <p className="font-bold text-stone-900">{order.customerName}</p>
                              {order.customerPhone && (
                                <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                                  {order.customerPhone}
                                </p>
                              )}
                              {order.tableOrAddress && (
                                <p className="text-[11px] text-stone-500 mt-0.5 max-w-[200px] truncate">
                                  {order.tableOrAddress}
                                </p>
                              )}
                            </td>

                            <td className="py-3.5 px-4 align-top max-w-xs">
                              <p className="text-stone-800 leading-relaxed">{order.itemSummary}</p>
                              {order.notes && (
                                <p className="text-[11px] text-stone-500 mt-0.5">
                                  Note: {order.notes}
                                </p>
                              )}
                            </td>

                            <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                              <p className="font-mono font-bold text-sm text-stone-900 tabular-nums">
                                ₹{order.grandTotal.toLocaleString('en-IN')}
                              </p>
                              {order.deliveryFee > 0 && (
                                <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                                  incl. ₹{order.deliveryFee} delivery
                                </p>
                              )}
                            </td>

                            <td className="py-3.5 px-4 align-top whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 font-semibold ${
                                  isConfirmed ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                {isConfirmed ? (
                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                ) : (
                                  <Clock className="w-4 h-4 shrink-0" />
                                )}
                                <span>{isConfirmed ? 'Order Confirmed' : 'Pending'}</span>
                              </span>
                            </td>

                            <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={isBusy || isConfirmed}
                                  onClick={() => handleStatusChange(order.orderId, 'confirmed')}
                                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                    isConfirmed
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy || !isConfirmed}
                                  onClick={() => handleStatusChange(order.orderId, 'pending')}
                                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                    !isConfirmed
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-default'
                                      : 'bg-stone-100 hover:bg-amber-500 hover:text-white text-stone-700'
                                  }`}
                                >
                                  Pending
                                </button>
                                {confirmDeleteOrderId === order.orderId ? (
                                  <div className="inline-flex items-center gap-1 ml-1">
                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() => handleDeleteOrder(order.orderId)}
                                      className="min-h-[38px] px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      {isBusy ? '...' : 'Yes'}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() => setConfirmDeleteOrderId(null)}
                                      className="min-h-[38px] px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => setConfirmDeleteOrderId(order.orderId)}
                                    className="min-h-[38px] min-w-[38px] px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 inline-flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                                    aria-label={`Delete order ${order.orderId}`}
                                    title="Delete Order"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-stone-200">
                  {filteredOrders.map((order) => {
                    const isConfirmed = order.status === 'confirmed';
                    const isBusy = updatingOrderId === order.orderId;
                    return (
                      <div key={order.orderId} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-stone-900">{order.customerName}</p>
                            <p className="text-xs text-stone-500 font-mono mt-0.5 tabular-nums">
                              #{order.orderId} · {formatTime(order.createdAt)} · {order.orderType}
                            </p>
                          </div>
                          <p className="text-base font-bold text-stone-900 font-mono tabular-nums">
                            ₹{order.grandTotal.toLocaleString('en-IN')}
                          </p>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed">{order.itemSummary}</p>

                        {(order.customerPhone || order.tableOrAddress) && (
                          <p className="text-xs text-stone-500">
                            {order.customerPhone}
                            {order.customerPhone && order.tableOrAddress ? ' · ' : ''}
                            {order.tableOrAddress}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              isConfirmed ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {isConfirmed ? (
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 shrink-0" />
                            )}
                            <span>{isConfirmed ? 'Order Confirmed' : 'Pending'}</span>
                          </span>

                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            <button
                              type="button"
                              disabled={isBusy || isConfirmed}
                              onClick={() => handleStatusChange(order.orderId, 'confirmed')}
                              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                isConfirmed
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              disabled={isBusy || !isConfirmed}
                              onClick={() => handleStatusChange(order.orderId, 'pending')}
                              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                !isConfirmed
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-stone-100 hover:bg-amber-500 hover:text-white text-stone-700'
                              }`}
                            >
                              Pending
                            </button>
                            {confirmDeleteOrderId === order.orderId ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleDeleteOrder(order.orderId)}
                                  className="min-h-[40px] px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {isBusy ? '...' : 'Delete'}
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => setConfirmDeleteOrderId(null)}
                                  className="min-h-[40px] px-2.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setConfirmDeleteOrderId(order.orderId)}
                                className="min-h-[40px] min-w-[40px] px-2.5 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 inline-flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                                aria-label={`Delete order ${order.orderId}`}
                                title="Delete Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {/* 3. Live Google Sheet Columns U, V, W Ledger */}
          {sheetSummary.entries.length > 0 && (
            <section className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Google Sheet Synced Log (Columns U · V · W)
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Live entries fetched from Menudata sheet (Customer Name, Item Name, Price)
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-stone-800 tabular-nums">
                  {sheetSummary.entries.length} Rows
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4">Row</th>
                      <th className="py-2.5 px-4">Customer Name (Col U)</th>
                      <th className="py-2.5 px-4">Item Name (Col V)</th>
                      <th className="py-2.5 px-4 text-right">Price (Col W)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {sheetSummary.entries.map((entry) => (
                      <tr key={`${entry.rowNumber}-${entry.customerName}-${entry.itemName}`}>
                        <td className="py-2.5 px-4 font-mono text-stone-400 tabular-nums">
                          {entry.rowNumber}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-stone-900">
                          {entry.customerName}
                        </td>
                        <td className="py-2.5 px-4 text-stone-700">{entry.itemName}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-stone-900 tabular-nums">
                          ₹{entry.price.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default CafeAdminPanel;
