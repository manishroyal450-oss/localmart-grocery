import React from 'react';
import { ShoppingBag, X, Trash2, ArrowRight, ShieldCheck, Truck, CheckCircle, PackageCheck, MessageCircle } from 'lucide-react';
import { CartItem, Product, Customer } from '../types';
import ProductPlaceholderImage from './ProductPlaceholderImage';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
  onClearCart: () => void;
  onCheckout: (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    deliveryType: 'delivery' | 'pickup';
  }) => Promise<any>;
  currentCustomer: Customer | null;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
  currentCustomer,
}: CartSidebarProps) {
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [customerAddress, setCustomerAddress] = React.useState('');
  const [deliveryType, setDeliveryType] = React.useState<'delivery' | 'pickup'>('delivery');
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [placedOrder, setPlacedOrder] = React.useState<any | null>(null);

  // Auto pre-fill if logged in customer
  React.useEffect(() => {
    if (isOpen) {
      if (currentCustomer) {
        setCustomerName(currentCustomer.fullName);
        setCustomerPhone(currentCustomer.phone);
        setCustomerAddress(`${currentCustomer.shippingAddress}, ${currentCustomer.city} - ${currentCustomer.pincode}`);
      } else {
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
      }
    }
  }, [currentCustomer, isOpen]);

  if (!isOpen) return null;

  // Compute pricing totals
  const totalSellingPrice = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalMRP = totalSellingPrice;
  const savings = 0;
  const deliveryCharges = 0;
  const finalAmount = totalSellingPrice;

  const handleSendOrderWhatsApp = (order: any) => {
    if (!order) return;
    
    let itemDetails = "";
    const itemsList = order.originalItems || order.items || [];
    if (itemsList.length > 0) {
      itemDetails = itemsList.map((item: any) => {
        const name = item.product?.name || item.name || "Item";
        const unit = item.product?.unit || item.unit || "";
        const qty = item.quantity || 1;
        const price = item.product?.price || item.price || 0;
        return `• ${name} (${unit}) x ${qty} = ₹${(qty * price).toFixed(2)}`;
      }).join("\n");
    } else {
      itemDetails = "Items not specified";
    }

    const deliveryEmoji = order.deliveryType === 'delivery' ? '🏠 Home Delivery' : '🏪 Self-Pickup';
    const addressStr = order.deliveryType === 'delivery' ? `\n📍 *Address:* ${order.customerAddress}` : '';

    const messageText = `*🛒 NEW ORDER PLACED AT BARI' ALL-IN-ONE MART*\n\n` +
      `📦 *Order ID:* #${order.id}\n` +
      `👤 *Customer Name:* ${order.customerName}\n` +
      `📞 *Phone:* ${order.customerPhone}\n` +
      `🚚 *Delivery Type:* ${deliveryEmoji}${addressStr}\n\n` +
      `📋 *Order Items:*\n${itemDetails}\n\n` +
      `💵 *Total Amount:* ₹${order.totalAmount}\n` +
      (order.savings > 0 ? `🎉 *Total Savings:* ₹${order.savings}\n` : '') +
      `\nThank you! Please process my order as soon as possible. 🙏`;

    const encodedMessage = encodeURIComponent(messageText);
    window.open(`https://wa.me/919719852037?text=${encodedMessage}`, '_blank');
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    if (deliveryType === 'delivery' && !customerAddress.trim()) {
      alert('Please provide your delivery address');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await onCheckout({
        customerName,
        customerPhone,
        customerAddress: deliveryType === 'pickup' ? 'Store Pickup' : customerAddress,
        deliveryType,
      });
      const enrichedOrder = { ...order, originalItems: [...cartItems] };
      setPlacedOrder(enrichedOrder);
      // Reset checkout form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      onClearCart();
    } catch (error: any) {
      alert(error.message || 'Checkout failed. Please verify item stock levels.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans" id="cart-overlay-panel">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-gray-50 flex flex-col shadow-2xl relative" id="cart-drawer-container">
          
          {/* Header */}
          <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between" id="cart-header">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-yellow-400" />
              <span>{placedOrder ? 'Order Placed!' : 'Your Shopping Cart'}</span>
            </h3>
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg transition-all shadow-md focus:outline-none disabled:opacity-50"
              id="close-cart-drawer"
            >
              <span>Close ❌</span>
            </button>
          </div>

          {/* Success Screen */}
          {placedOrder ? (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center bg-white" id="order-success-screen">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-500 animate-bounce">
                <CheckCircle className="h-12 w-12" />
              </div>
              <h4 className="text-2xl font-black text-gray-900 mb-1">Thank You!</h4>
              <p className="text-sm font-semibold text-emerald-600 mb-6">Your order has been placed successfully.</p>
              
              <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6 text-left" id="order-success-summary">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-3">
                  <span className="text-xs text-gray-500 font-bold">ORDER ID</span>
                  <span className="text-sm font-extrabold text-emerald-800 font-mono">#{placedOrder.id}</span>
                </div>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <p><strong className="text-gray-900">Name:</strong> {placedOrder.customerName}</p>
                  <p><strong className="text-gray-900">Phone:</strong> {placedOrder.customerPhone}</p>
                  <p><strong className="text-gray-900">Type:</strong> {placedOrder.deliveryType === 'delivery' ? '🏠 Home Delivery' : '🏪 Self-Pickup'}</p>
                  {placedOrder.deliveryType === 'delivery' && (
                    <p><strong className="text-gray-900">Address:</strong> {placedOrder.customerAddress}</p>
                  )}
                  <p><strong className="text-gray-900">Total Amount:</strong> ₹{placedOrder.totalAmount}</p>
                  {placedOrder.savings > 0 && (
                    <p className="text-emerald-600 font-bold"><strong className="text-gray-900">You Saved:</strong> ₹{placedOrder.savings}!</p>
                  )}
                </div>
              </div>

              <div className="w-full space-y-3">
                <div className="flex flex-col gap-1 text-xs text-gray-600 justify-center items-center bg-emerald-50/70 p-3 rounded border border-emerald-100 text-center">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <PackageCheck className="h-4 w-4" />
                    <span>The store owner is packing your items now.</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 font-semibold leading-relaxed">
                    Need fast dispatch or home delivery? <br />
                    Call us: <a href="tel:+919719852037" className="text-emerald-800 font-black hover:underline font-mono">+91 97198 52037</a> <br />
                    WhatsApp: <a href="https://wa.me/919719852037" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-black hover:underline font-mono">+91 97198 52037</a>
                  </p>
                </div>
                
                <button
                  onClick={() => handleSendOrderWhatsApp(placedOrder)}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-extrabold py-3 px-4 rounded shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                  id="success-send-whatsapp"
                >
                  <MessageCircle className="h-5 w-5 text-white" />
                  SHARE ORDER ON WHATSAPP
                </button>

                <button
                  onClick={() => {
                    setPlacedOrder(null);
                    onClose();
                  }}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3 px-4 rounded shadow transition-all active:scale-[0.98]"
                  id="success-continue-shopping"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Content section */}
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white" id="empty-cart-state">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="h-8 w-8 text-emerald-800" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">Your Cart is Empty</h4>
                  <p className="text-sm text-gray-500 text-center mt-1 max-w-xs">
                    Explore our Bari' All-In-One Mart shelves and add fresh premium items to start your shopping journey!
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded shadow"
                  >
                    START SHOPPING
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* Item List */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" id="cart-items-list">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-xs font-bold text-gray-500 uppercase">Selected Items ({cartItems.length})</span>
                      <button 
                        onClick={onClearCart}
                        className="text-xs text-rose-500 font-semibold hover:underline flex items-center gap-1"
                        id="clear-all-cart"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Clear All
                      </button>
                    </div>

                    {cartItems.map((item) => (
                      <div 
                        key={item.product.id}
                        className="bg-white rounded-lg border border-gray-200 p-3 flex gap-3 hover:shadow-sm transition"
                        id={`cart-item-${item.product.id}`}
                      >
                        <div className="w-16 h-16 rounded overflow-hidden border border-gray-100 flex-shrink-0">
                          <ProductPlaceholderImage
                            image={item.product.image}
                            name={item.product.name}
                            category={item.product.category}
                          />
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h4 className="text-xs font-bold text-gray-800 truncate leading-snug">{item.product.name}</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">Unit: {item.product.unit}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-extrabold text-gray-900">₹{item.product.price}</span>
                              {item.product.originalPrice > item.product.price && (
                                <span className="text-[10px] text-gray-400 line-through">₹{item.product.originalPrice}</span>
                              )}
                            </div>

                            {/* Quantity buttons */}
                            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                              <button
                                onClick={() => onRemoveFromCart(item.product)}
                                className="bg-gray-50 hover:bg-gray-100 text-gray-600 font-extrabold px-2 py-1 text-xs"
                              >
                                &minus;
                              </button>
                              <span className="px-2.5 py-1 text-xs font-extrabold bg-white text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onAddToCart(item.product)}
                                disabled={item.quantity >= item.product.stock}
                                className="bg-gray-50 hover:bg-gray-100 text-gray-600 font-extrabold px-2 py-1 text-xs disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Summary - Flipkart Style */}
                  <div className="bg-white border-t border-gray-200 p-6 space-y-3 shadow-inner" id="cart-price-summary">
                    <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Price Details</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Price ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                        <span>₹{totalMRP}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charges</span>
                        <span className="text-emerald-600 font-bold">FREE Delivery</span>
                      </div>

                      <div className="border-t border-dashed pt-3 flex justify-between font-extrabold text-base text-gray-900">
                        <span>Total Amount</span>
                        <span>₹{finalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Form */}
                  <div className="bg-white border-t border-gray-200 p-6 overflow-y-auto" id="cart-checkout-form">
                    <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3">Delivery Information</h4>
                    
                    <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                      {/* Delivery Mode Toggle */}
                      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setDeliveryType('delivery')}
                          className={`py-1.5 text-xs font-bold rounded-md transition flex items-center justify-center gap-1 ${
                            deliveryType === 'delivery' 
                              ? 'bg-white text-emerald-800 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Truck className="h-3.5 w-3.5" /> Home Delivery
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryType('pickup')}
                          className={`py-1.5 text-xs font-bold rounded-md transition flex items-center justify-center gap-1 ${
                            deliveryType === 'pickup' 
                              ? 'bg-white text-emerald-800 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          🏪 Store Pickup
                        </button>
                      </div>

                      {/* Name input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter your name"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>

                      {/* Phone input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="Enter 10-digit phone number"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>

                      {/* Address input (conditional) */}
                      {deliveryType === 'delivery' && (
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Full Delivery Address *</label>
                          <textarea
                            required
                            rows={2}
                            placeholder="Street, Landmark, Apartment, Block details"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Pulse-Border Animated No-Return Policy Notice */}
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-800 text-[11.5px] leading-relaxed animate-pulse-border mt-3">
                        <div className="flex items-center gap-1.5 font-extrabold uppercase text-red-700 mb-1 text-[11px]">
                          <span>🚫 Store Return Policy</span>
                        </div>
                        <p className="font-semibold text-red-900">
                          Bari' Mart operates on a strict <strong className="font-black underline text-red-700">No Product Return After Sale</strong> policy. Please inspect and verify your items carefully upon delivery or pickup.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold py-3 px-4 rounded shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] disabled:bg-gray-400 disabled:pointer-events-none mt-4"
                        id="place-order-submit-btn"
                      >
                        {isSubmitting ? 'PROCESSING ORDER...' : 'PLACE ORDER NOW'}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </div>

                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
