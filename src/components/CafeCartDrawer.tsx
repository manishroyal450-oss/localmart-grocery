import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  UtensilsCrossed,
  MessageCircle,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { MenuItem, CafeCartItem } from '../types';
import { getItemImageUrl } from '../services/menuService';
import { calculateCartSummary } from '../services/cartService';
import { UserProfile } from '../services/authService';

interface CafeCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CafeCartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  currentUser?: UserProfile | null;
  onOpenProfile?: () => void;
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
}) => {
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableOrAddress, setTableOrAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderPlaced, setOrderPlaced] = useState<any | null>(null);

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

  const { totalItems, subtotal, deliveryCharge, packagingCharge, grandTotal } =
    calculateCartSummary(cartItems);

  // Handle WhatsApp Checkout
  const handlePlaceOrderViaWhatsApp = () => {
    if (cartItems.length === 0) return;

    const itemsSummary = cartItems
      .map(
        (ci) =>
          `• ${ci.item.name}${ci.variant && ci.variant !== 'Standard' ? ` (${ci.variant})` : ''} x ${ci.quantity} = ₹${ci.price * ci.quantity}`
      )
      .join('\n');

    const typeLabel =
      orderType === 'dine-in'
        ? '🍽️ Dine-In / Table Order'
        : orderType === 'takeaway'
        ? '🛍️ Takeaway / Pickup'
        : '🛵 Home Delivery';

    const orderId = `FFC-${Math.floor(100000 + Math.random() * 900000)}`;

    const text =
      `*☕ FRIENDS 4 EVER COFFEE CAFE - NEW ORDER*\n` +
      `--------------------------------------\n` +
      `🧾 *Order ID:* #${orderId}\n` +
      `📌 *Order Type:* ${typeLabel}\n` +
      `👤 *Customer Name:* ${customerName || 'Guest'}\n` +
      `📞 *Phone:* ${customerPhone || 'Not provided'}\n` +
      (tableOrAddress
        ? orderType === 'dine-in'
          ? `🪑 *Table No / Seat:* ${tableOrAddress}\n`
          : `📍 *Address:* ${tableOrAddress}\n`
        : '') +
      (specialInstructions ? `📝 *Note:* ${specialInstructions}\n` : '') +
      `--------------------------------------\n` +
      `📋 *Order Items:*\n${itemsSummary}\n` +
      `--------------------------------------\n` +
      `💰 *Total Amount:* ₹${grandTotal}\n` +
      `--------------------------------------\n` +
      `Please confirm my order. Thank you! 🙏`;

    const encoded = encodeURIComponent(text);
    const cafePhone = '919719852037'; // +91 97198 52037 WhatsApp Order Number

    // Set order placed state for UI feedback
    setOrderPlaced({
      orderId,
      items: [...cartItems],
      total: grandTotal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    onClearCart();
    window.open(`https://wa.me/${cafePhone}?text=${encoded}`, '_blank');
  };

  const handleInAppConfirmOrder = () => {
    if (cartItems.length === 0) return;
    const orderId = `FFC-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderPlaced({
      orderId,
      items: [...cartItems],
      total: grandTotal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    onClearCart();
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
        className="relative z-10 w-full max-w-lg bg-stone-50 h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 border-l border-stone-200"
      >
        {/* Header */}
        <div className="bg-white px-4 sm:px-6 py-4 border-b border-stone-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shadow-2xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                  Your Cart
                </h2>
                {totalItems > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                Friends 4 Ever Coffee Cafe • Pure Veg
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-[11px] font-bold text-stone-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear all items in cart"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Clear</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
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
              </div>

              <div className="mt-6 flex flex-col gap-2">
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
              <div className="bg-white rounded-2xl p-3 sm:p-4 border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-700">
                    Selected Dishes ({totalItems})
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    100% Pure Veg
                  </span>
                </div>

                <div className="divide-y divide-stone-100">
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
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                              {ci.item.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              {ci.variant && ci.variant !== 'Standard' && (
                                <span className="inline-block text-[10px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.2 rounded">
                                  {ci.variant}
                                </span>
                              )}
                              <span className="text-xs font-bold text-rose-600">
                                ₹{ci.price}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Quantity Adjuster */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center rounded-xl bg-stone-100 border border-stone-200 p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(ci.cartItemId, -1)}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-stone-50 text-stone-800 flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-90"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="w-7 text-center font-black text-xs text-stone-900">
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
                            <span className="text-xs font-black text-stone-900">
                              ₹{ci.price * ci.quantity}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(ci.cartItemId)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
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

              {/* Order Mode (Dine-in / Takeaway / Delivery) */}
              <div className="bg-white rounded-2xl p-3 sm:p-4 border border-stone-200 shadow-2xs">
                <label className="block text-xs font-bold text-stone-800 mb-2">
                  Order Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('dine-in')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                      orderType === 'dine-in'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    🍽️ Dine-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('takeaway')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                      orderType === 'takeaway'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    🛍️ Takeaway
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                      orderType === 'delivery'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    🛵 Delivery
                  </button>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="bg-white rounded-2xl p-3 sm:p-4 border border-stone-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">
                    Customer Information
                  </span>
                  {currentUser ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Logged in as {currentUser.fullName.split(' ')[0]}
                    </span>
                  ) : (
                    onOpenProfile && (
                      <button
                        type="button"
                        onClick={onOpenProfile}
                        className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
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
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-stone-50"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-stone-50"
                  />
                </div>

                <input
                  type="text"
                  placeholder={
                    orderType === 'dine-in'
                      ? 'Table Number (e.g. Table 4)'
                      : 'Delivery Address / Pickup Instructions'
                  }
                  value={tableOrAddress}
                  onChange={(e) => setTableOrAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-stone-50"
                />

                <input
                  type="text"
                  placeholder="Special instructions (e.g. extra cheese, less spicy)"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-stone-50"
                />
              </div>

              {/* Bill Details Breakdown */}
              <div className="bg-white rounded-2xl p-3 sm:p-4 border border-stone-200 shadow-2xs space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-rose-600" />
                  Bill Details
                </span>

                <div className="text-xs text-stone-600 space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span>Items Subtotal ({totalItems} items)</span>
                    <span className="font-semibold text-stone-900">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-stone-500">
                    <span>Taxes & Restaurant GST</span>
                    <span className="text-emerald-600 font-bold">₹0 (Included)</span>
                  </div>

                  <div className="flex justify-between text-stone-500">
                    <span>Delivery & Packaging</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>

                  <div className="border-t border-stone-200 pt-2 flex justify-between items-center text-sm font-black text-stone-900">
                    <span>To Pay</span>
                    <span className="text-base text-rose-600">₹{grandTotal}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions (Only when items exist and order not yet placed) */}
        {cartItems.length > 0 && !orderPlaced && (
          <div className="bg-white px-4 sm:px-6 py-4 border-t border-stone-200 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Grand Total</span>
              <span className="text-lg font-black text-stone-900">
                ₹{grandTotal}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* WhatsApp Checkout Button */}
              <button
                type="button"
                onClick={handlePlaceOrderViaWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                title="Send order directly to Cafe on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Order via WhatsApp 📲</span>
              </button>

              {/* Confirm In-App Order Button */}
              <button
                type="button"
                onClick={handleInAppConfirmOrder}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <span>Confirm Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-center text-stone-500 font-medium">
              WhatsApp Orders: <span className="font-bold text-emerald-600">+91 97198 52037</span> • Friends 4 Ever Coffee Cafe, Chandpur
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CafeCartDrawer;
