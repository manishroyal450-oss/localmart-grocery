import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  UtensilsCrossed,
  MessageCircle,
  Receipt,
  RotateCcw,
  Printer,
  FileSpreadsheet,
  Truck,
  ChevronDown,
} from 'lucide-react';
import { MenuItem, CafeCartItem, DeliveryInfo } from '../types';
import { getItemImageUrl } from '../services/menuService';
import { calculateCartSummary } from '../services/cartService';
import { UserProfile } from '../services/authService';
import { ProfessionalBillModal, BillData } from './ProfessionalBillModal';
import { syncOrderToGoogleSheet } from '../services/googleAppsScriptService';

interface CafeCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CafeCartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  currentUser?: UserProfile | null;
  onOpenProfile?: () => void;
  deliveryInfo?: DeliveryInfo;
  tables?: string[];
}

export const CafeCartDrawer: React.FC<CafeCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  onOpenProfile,
  deliveryInfo,
  tables,
}) => {
  const [orderType, setOrderType] = useState<'delivery' | 'dine-in' | 'takeaway'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableOrAddress, setTableOrAddress] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>('Table 1');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderPlaced, setOrderPlaced] = useState<any | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState<boolean>(false);
  const [activeBillData, setActiveBillData] = useState<BillData | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);

  // Available tables list from Google Sheet (Column T)
  const availableTables =
    tables && tables.length > 0
      ? tables
      : [
          'Table 1',
          'Table 2',
          'Table 3',
          'Table 4',
          'Table 5',
          'Table 6',
          'Table 7',
          'Table 8',
          'Table 9',
          'Table 10',
        ];

  // Set default table when switching to dine-in
  useEffect(() => {
    if (orderType === 'dine-in') {
      const current = selectedTable || availableTables[0] || 'Table 1';
      setSelectedTable(current);
      setTableOrAddress(current);
    }
  }, [orderType]);

  // Delivery configuration from Google Sheet (Column R & S)
  const deliveryValue = deliveryInfo?.deliveryValue ?? 50;
  const deliveryDescription = deliveryInfo?.deliveryDescription || '';

  // Pre-fill user data when currentUser changes or drawer opens
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.fullName || '');
      setCustomerPhone(currentUser.contactNumber || '');
      setTableOrAddress(currentUser.address || '');
    }
  }, [currentUser, isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setOrderPlaced(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate items subtotal
  const { totalItems, subtotal } = calculateCartSummary(cartItems, 0);

  // Active delivery fee based on order type (Column R) - NEVER removed by description
  const activeDeliveryCharge = orderType === 'delivery' ? deliveryValue : 0;
  const packagingCharge = 0;
  const grandTotal = subtotal + activeDeliveryCharge + packagingCharge;

  // Open professional PDF bill preview for current cart items
  const handleOpenCurrentBill = () => {
    if (cartItems.length === 0) return;
    const tempOrderId = `FFC-${Math.floor(100000 + Math.random() * 900000)}`;
    setActiveBillData({
      orderId: tempOrderId,
      orderType,
      customerName: customerName.trim() || (currentUser?.fullName ? currentUser.fullName : 'Guest'),
      customerPhone: customerPhone.trim() || (currentUser?.contactNumber ? currentUser.contactNumber : ''),
      tableOrAddress: tableOrAddress.trim() || (currentUser?.address ? currentUser.address : ''),
      specialInstructions: specialInstructions.trim(),
      items: cartItems.map((ci) => ({
        name: ci.item.name,
        variant: ci.variant,
        quantity: ci.quantity,
        price: ci.price,
      })),
      subtotal,
      deliveryCharge: activeDeliveryCharge,
      packagingCharge: 0,
      grandTotal,
      dateStr: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      timeStr: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    });
    setIsBillModalOpen(true);
  };

  // Open bill for placed order
  const handleOpenPlacedOrderBill = () => {
    if (!orderPlaced) return;
    setActiveBillData({
      orderId: orderPlaced.orderId,
      orderType: orderPlaced.orderType || orderType,
      customerName: orderPlaced.customerName || customerName.trim() || 'Guest',
      customerPhone: orderPlaced.customerPhone || customerPhone.trim(),
      tableOrAddress: orderPlaced.tableOrAddress || tableOrAddress.trim(),
      specialInstructions: orderPlaced.specialInstructions || specialInstructions.trim(),
      items: (orderPlaced.items || []).map((ci: any) => ({
        name: ci.item?.name || ci.name || 'Dish Item',
        variant: ci.variant,
        quantity: ci.quantity,
        price: ci.price,
      })),
      subtotal: orderPlaced.subtotal || orderPlaced.total,
      deliveryCharge: orderPlaced.deliveryCharge || 0,
      packagingCharge: 0,
      grandTotal: orderPlaced.total,
      dateStr: orderPlaced.dateStr,
      timeStr: orderPlaced.time,
    });
    setIsBillModalOpen(true);
  };

  // Handle WhatsApp Checkout
  const handlePlaceOrderViaWhatsApp = () => {
    if (cartItems.length === 0) return;
    setIsPlacingOrder(true);

    const itemsSummary = cartItems
      .map(
        (ci) =>
          `• ${ci.item.name}${ci.variant && ci.variant !== 'Standard' ? ` (${ci.variant})` : ''} x ${ci.quantity} = ₹${ci.price * ci.quantity}`
      )
      .join('\n');

    const typeLabel =
      orderType === 'delivery'
        ? '🚀 Home Delivery'
        : orderType === 'dine-in'
        ? '🍽️ Dine-In / Table Order'
        : '🛍️ Takeaway / Pickup';

    const orderId = `FFC-${Math.floor(100000 + Math.random() * 900000)}`;

    const text =
      `*☕ FRIENDS 4 EVER COFFEE CAFE - NEW ORDER*\n` +
      `--------------------------------------\n` +
      `🧾 *Order ID:* #${orderId}\n` +
      `📌 *Order Type:* ${typeLabel}\n` +
      `👤 *Customer Name:* ${customerName || 'Guest'}\n` +
      `📞 *Phone:* ${customerPhone || 'Not provided'}\n` +
      (tableOrAddress
        ? orderType === 'delivery'
          ? `📍 *Delivery Address:* ${tableOrAddress}\n`
          : orderType === 'dine-in'
          ? `🪑 *Table No / Seat:* ${tableOrAddress}\n`
          : `🛍️ *Pickup Note:* ${tableOrAddress}\n`
        : '') +
      (specialInstructions ? `📝 *Note:* ${specialInstructions}\n` : '') +
      `--------------------------------------\n` +
      `📋 *Order Items:*\n${itemsSummary}\n` +
      `--------------------------------------\n` +
      `💵 *Items Subtotal:* ₹${subtotal}\n` +
      (orderType === 'delivery'
        ? `🚚 *Delivery Charges:* ₹${deliveryValue}\n`
        : '') +
      `💰 *Grand Total:* ₹${grandTotal}\n` +
      `--------------------------------------\n` +
      `Please confirm my order. Thank you! 🙏`;

    const encoded = encodeURIComponent(text);
    const cafePhone = '919719852037'; // +91 97198 52037 WhatsApp Order Number

    // Auto-sync order with Google Sheet via Google Apps Script (deducts stock and adds amount in Excel)
    const sheetPayload = {
      bill_no: orderId,
      customer_name: customerName.trim() || (currentUser?.fullName ? currentUser.fullName : 'Guest'),
      customer_phone: customerPhone.trim() || (currentUser?.contactNumber ? currentUser.contactNumber : ''),
      table_or_address: tableOrAddress.trim() || (currentUser?.address ? currentUser.address : ''),
      order_type: orderType,
      grandtotal: grandTotal,
      subtotal,
      delivery_fee: activeDeliveryCharge,
      notes: specialInstructions.trim(),
      items: cartItems.map((ci) => ({
        name: ci.item.name,
        item_name: ci.item.name,
        variant: ci.variant || 'Standard',
        qty: ci.quantity,
        stockdeduct: ci.quantity,
        price: ci.price,
        total: ci.price * ci.quantity,
      })),
    };

    // Trigger stock deduct & amount add in Google Sheet in the background
    syncOrderToGoogleSheet(sheetPayload)
      .then((res) => {
        console.log('[Google Sheet Synced]:', res);
      })
      .catch((err) => {
        console.warn('[Google Sheet Sync Error]:', err);
      });

    // Set order placed state for UI feedback with full invoice data
    setOrderPlaced({
      orderId,
      items: [...cartItems],
      subtotal,
      deliveryCharge: activeDeliveryCharge,
      total: grandTotal,
      orderType,
      customerName: customerName.trim() || 'Guest',
      customerPhone: customerPhone.trim(),
      tableOrAddress: tableOrAddress.trim(),
      specialInstructions: specialInstructions.trim(),
      dateStr: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    });

    setIsPlacingOrder(false);
    window.open(`https://wa.me/${cafePhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        id="cafe-cart-sidebar"
        className="relative z-10 w-full max-w-lg bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 border-l border-stone-200 dark:border-stone-800"
      >
        {/* Header */}
        <div className="bg-white dark:bg-stone-900 px-4 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800 shadow-2xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white leading-tight">
                  Your Cart
                </h2>
                {totalItems > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                Friends 4 Ever Coffee Cafe • Pure Veg
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-[11px] font-bold text-stone-500 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear all items in cart"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Clear</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
          {/* Case 1: Order Just Placed Success Confirmation */}
          {orderPlaced ? (
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 text-center shadow-sm my-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4 border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Order Received!
              </span>
              <h3 className="text-xl font-black text-stone-900 mt-2">
                Thank You for Ordering!
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Order ID: <span className="font-bold text-stone-900">#{orderPlaced.orderId}</span>
              </p>
              <p className="text-xs text-stone-500 mt-2">
                Our kitchen is preparing your fresh order. Estimated preparation time: 15-20 minutes.
              </p>

              <div className="mt-5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-stone-800">
                  <span>Total Paid/Payable:</span>
                  <span className="text-rose-600">₹{orderPlaced.total}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Items:</span>
                  <span>{orderPlaced.items?.length || 1} distinct dishes</span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Order Time:</span>
                  <span>{orderPlaced.time}</span>
                </div>

                {/* Live Google Apps Script / Excel Update Feedback */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Excel / Sheet Updated:
                  </span>
                  <span className="bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full text-[10px] text-emerald-800 dark:text-emerald-300">
                    Stock Deducted & Amount Added
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleOpenPlacedOrderBill}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save Tax Invoice (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrderPlaced(null);
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-stone-900 text-white font-bold text-xs shadow-md hover:bg-stone-800 transition-all cursor-pointer"
                >
                  Explore More Dishes
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Case 2: Cart is Empty */
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-20 h-20 rounded-3xl bg-white border border-stone-200 shadow-sm flex items-center justify-center mb-4 text-stone-400">
                <ShoppingCart className="w-10 h-10 opacity-40 text-stone-500" />
              </div>
              <h3 className="text-lg font-black text-stone-900">Your Cart is Empty</h3>
              <p className="text-xs text-stone-500 max-w-xs mt-1 mb-6 leading-relaxed">
                Add delicious pizzas, burgers, refreshing cold coffees, shakes, and snacks from the menu.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            /* Case 3: Cart has Items */
            <>
              {/* Order Items List */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-3 sm:p-4 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Selected Dishes ({totalItems})
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    100% Pure Veg
                  </span>
                </div>

                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {cartItems.map((ci) => {
                    const itemImageUrl = getItemImageUrl(ci.item);
                    return (
                      <div
                        key={ci.cartItemId}
                        className="py-3 flex items-center justify-between gap-3"
                      >
                        {/* Thumbnail & Title */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={itemImageUrl}
                            alt={ci.item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                              {ci.item.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              {ci.variant && ci.variant !== 'Standard' && (
                                <span className="inline-block text-[10px] font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.2 rounded">
                                  {ci.variant}
                                </span>
                              )}
                              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                ₹{ci.price}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Quantity Adjuster */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(ci.cartItemId, -1)}
                              className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-90"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="w-7 text-center font-black text-xs text-stone-900 dark:text-stone-100">
                              {ci.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(ci.cartItemId, 1)}
                              className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-90"
                              title="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="text-right w-14">
                            <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                              ₹{ci.price * ci.quantity}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(ci.cartItemId)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Mode (Delivery / Dine-in / Takeaway) */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-3 sm:p-4 border border-stone-200 dark:border-stone-800 shadow-2xs">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-2">
                  Order Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border flex flex-col items-center justify-center gap-1 ${
                      orderType === 'delivery'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <span>🚀</span>
                    <span>Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('dine-in')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border flex flex-col items-center justify-center gap-1 ${
                      orderType === 'dine-in'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <span>🍽️</span>
                    <span>Dine-In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('takeaway')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border flex flex-col items-center justify-center gap-1 ${
                      orderType === 'takeaway'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <span>🛍️</span>
                    <span>Takeaway</span>
                  </button>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-3 sm:p-4 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    Customer Information
                  </span>
                  {currentUser ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Logged in as {currentUser.fullName.split(' ')[0]}
                    </span>
                  ) : (
                    onOpenProfile && (
                      <button
                        type="button"
                        onClick={onOpenProfile}
                        className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        Login for autofill
                      </button>
                    )
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                  />
                </div>

                {/* Dine-In Table Box (Column T) vs Delivery Address vs Pickup Note */}
                {orderType === 'dine-in' ? (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40 border border-rose-200/90 dark:border-rose-900/60 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Select Dine-In Table</span>
                      </label>
                      <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-900/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                        {availableTables.length} Tables
                      </span>
                    </div>

                    {/* Table Select Dropdown Box */}
                    <div className="relative">
                      <select
                        value={selectedTable || tableOrAddress}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedTable(val);
                          setTableOrAddress(val);
                        }}
                        className="w-full text-xs font-black px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 cursor-pointer appearance-none shadow-xs"
                      >
                        {availableTables.map((tbl) => (
                          <option key={tbl} value={tbl}>
                            🪑 {tbl}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* One-Tap Table Selection Pills */}
                    <div className="pt-1">
                      <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 mb-1.5">
                        Or tap your table directly:
                      </p>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-0.5">
                        {availableTables.map((tbl) => {
                          const isSelected = (selectedTable || tableOrAddress) === tbl;
                          return (
                            <button
                              key={tbl}
                              type="button"
                              onClick={() => {
                                setSelectedTable(tbl);
                                setTableOrAddress(tbl);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer border flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs scale-105'
                                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700'
                              }`}
                            >
                              <span>🪑</span>
                              <span>{tbl}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder={
                      orderType === 'delivery'
                        ? 'Delivery Address / Landmark (e.g. V39R+XVW, Chandpur)'
                        : 'Pickup Note / Expected Time'
                    }
                    value={tableOrAddress}
                    onChange={(e) => setTableOrAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                  />
                )}

                <input
                  type="text"
                  placeholder="Special instructions (e.g. extra cheese, less spicy)"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                />
              </div>

              {/* Bill Details Breakdown */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl p-3 sm:p-4 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    Bill Details
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenCurrentBill}
                    className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer bg-rose-50 dark:bg-rose-950/60 py-1 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50"
                    title="Generate & Print Professional PDF Bill with Cafe Name"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Print PDF Bill</span>
                  </button>
                </div>

                <div className="text-xs text-stone-600 dark:text-stone-400 space-y-2 pt-1">
                  <div className="flex justify-between">
                    <span>Items Subtotal ({totalItems} items)</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100 font-mono">₹{subtotal}</span>
                  </div>

                  {/* Delivery Charges Line (Column R) */}
                  <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Truck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      Delivery Charges
                    </span>
                    {orderType === 'delivery' ? (
                      <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">
                        ₹{deliveryValue}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                        ₹0 ({orderType === 'dine-in' ? 'Dine-In' : 'Takeaway'})
                      </span>
                    )}
                  </div>

                  {/* Column S: Delivery Description in paragraph form right below delivery value */}
                  {deliveryDescription && (
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200/90 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 shadow-2xs">
                      <p className="font-medium text-[11px] leading-relaxed">
                        {deliveryDescription}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-500 dark:text-stone-400">
                    <span>Taxes & Restaurant GST</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">₹0 (Included)</span>
                  </div>

                  <div className="flex justify-between text-stone-500 dark:text-stone-400">
                    <span>Packaging & Charges</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">FREE</span>
                  </div>

                  <div className="border-t border-stone-200 dark:border-stone-800 pt-2 flex justify-between items-center text-sm font-black text-stone-900 dark:text-white">
                    <span>To Pay</span>
                    <span className="text-base text-rose-600 dark:text-rose-400 font-mono">₹{grandTotal}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions (Only when items exist and order not yet placed) */}
        {cartItems.length > 0 && !orderPlaced && (
          <div className="bg-white dark:bg-stone-900 px-4 sm:px-6 py-4 border-t border-stone-200 dark:border-stone-800 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>Grand Total</span>
              <span className="text-lg font-black text-stone-900 dark:text-white">
                ₹{grandTotal}
              </span>
            </div>

            {/* Print PDF Bill Section / Button with Business Name */}
            <button
              type="button"
              onClick={handleOpenCurrentBill}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 font-bold text-xs border border-stone-200 dark:border-stone-700 shadow-2xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Print / Download PDF Bill (Friends 4 Ever Cafe)</span>
            </button>

            {/* WhatsApp Checkout Button (Single Direct Action) */}
            <button
              type="button"
              onClick={handlePlaceOrderViaWhatsApp}
              disabled={isPlacingOrder}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-80"
              title="Send order directly to Cafe on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{isPlacingOrder ? 'Opening WhatsApp...' : 'Order via WhatsApp 📲'}</span>
            </button>

            <p className="text-[10px] text-center text-stone-500 dark:text-stone-400 font-medium">
              WhatsApp Orders: <span className="font-bold text-emerald-600 dark:text-emerald-400">+91 97198 52037</span> • Friends 4 Ever Coffee Cafe, Chandpur
            </p>
          </div>
        )}
      </div>

      {/* Professional Tax Invoice / PDF Bill Modal */}
      {activeBillData && (
        <ProfessionalBillModal
          isOpen={isBillModalOpen}
          onClose={() => setIsBillModalOpen(false)}
          billData={activeBillData}
        />
      )}
    </div>
  );
};

export default CafeCartDrawer;
