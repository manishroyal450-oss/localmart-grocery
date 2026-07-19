import React from 'react';
import { X, User, Phone, MapPin, Building2, Map, Package, ShoppingBag, ShieldCheck, Clock, CheckCircle2, ChevronRight, Edit2, Check, RefreshCw } from 'lucide-react';
import { Customer } from '../types';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer: Customer | null;
  onUpdateProfile: (updatedCustomer: Customer) => void;
}

export default function CustomerAccountModal({
  isOpen,
  onClose,
  currentCustomer,
  onUpdateProfile,
}: CustomerAccountModalProps) {
  const [activeTab, setActiveTab] = React.useState<'profile' | 'orders'>('profile');
  
  // Profile editing state
  const [isEditing, setIsEditing] = React.useState(false);
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [shippingAddress, setShippingAddress] = React.useState('');
  const [city, setCity] = React.useState('');
  const [pincode, setPincode] = React.useState('');
  
  // Order history state
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(false);
  const [expandedOrderId, setExpandedOrderId] = React.useState<string | null>(null);

  // Error & loading status
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [updating, setUpdating] = React.useState(false);

  // Sync state with current customer
  React.useEffect(() => {
    if (isOpen && currentCustomer) {
      setFullName(currentCustomer.fullName || '');
      setPhone(currentCustomer.phone || '');
      setShippingAddress(currentCustomer.shippingAddress || '');
      setCity(currentCustomer.city || '');
      setPincode(currentCustomer.pincode || '');
      setIsEditing(false);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, currentCustomer]);

  // Load customer orders (Localized)
  const loadOrders = async () => {
    if (!currentCustomer?.phone) return;
    setLoadingOrders(true);
    try {
      const savedOrdersStr = localStorage.getItem('localmart_grocery_orders') || '[]';
      const savedOrders = JSON.parse(savedOrdersStr);
      const filtered = savedOrders.filter((o: any) => o.customerPhone === currentCustomer.phone);
      setOrders(filtered);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && currentCustomer && activeTab === 'orders') {
      loadOrders();
    }
  }, [isOpen, activeTab, currentCustomer]);

  if (!isOpen || !currentCustomer) return null;

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError('Please provide a valid 10-digit phone number');
      return;
    }
    if (!shippingAddress.trim()) {
      setError('Shipping address is required');
      return;
    }
    if (!city.trim()) {
      setError('City is required');
      return;
    }
    if (!pincode.trim() || pincode.trim().length !== 6) {
      setError('Enter a valid 6-digit Pincode');
      return;
    }

    setUpdating(true);
    try {
      // Update local storage of registered customers
      const savedCustomersStr = localStorage.getItem('localmart_grocery_customers') || '[]';
      const savedCustomers: Customer[] = JSON.parse(savedCustomersStr);

      const updatedCustomers = savedCustomers.map((c: Customer) => {
        if (c.email.toLowerCase() === currentCustomer.email.toLowerCase()) {
          return {
            ...c,
            fullName: fullName.trim(),
            phone: phone.trim(),
            shippingAddress: shippingAddress.trim(),
            city: city.trim(),
            pincode: pincode.trim(),
          };
        }
        return c;
      });

      localStorage.setItem('localmart_grocery_customers', JSON.stringify(updatedCustomers));

      const updatedCustomer: Customer = {
        ...currentCustomer,
        fullName: fullName.trim(),
        phone: phone.trim(),
        shippingAddress: shippingAddress.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
      };

      onUpdateProfile(updatedCustomer);
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Error updating profile.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-8 overflow-y-auto" id="customer-account-modal">
      <div className="w-full max-w-2xl bg-[#111315] border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#151719]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-inner uppercase">
              {currentCustomer.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="font-extrabold text-sm md:text-base tracking-wider uppercase text-gray-100">
                MY ACCOUNT DASHBOARD
              </h2>
              <p className="text-[10px] text-gray-400 font-mono tracking-tight">{currentCustomer.email}</p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff9f00] hover:bg-orange-600 text-white font-extrabold text-[11px] rounded-lg transition-all shadow-md"
            id="account-close-btn"
          >
            <span>Close ❌</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[#131517] border-b border-gray-800 text-xs font-black uppercase tracking-widest">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'profile' 
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/20'
            }`}
            id="tab-profile-btn"
          >
            <span className="flex items-center justify-center gap-2">
              <User className="h-3.5 w-3.5" />
              My Profile
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              activeTab === 'orders' 
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/20'
            }`}
            id="tab-orders-btn"
          >
            <span className="flex items-center justify-center gap-2">
              <Package className="h-3.5 w-3.5" />
              Order History
            </span>
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          
          {/* Alerts */}
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-lg flex items-center gap-2" id="account-error-banner">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-lg flex items-center gap-2" id="account-success-banner">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">Delivery & Profile Information</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Keep your active shipping details updated to enjoy flawless checkout delivery routing.
                  </p>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setSuccessMsg(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white text-xs font-bold rounded-lg border border-gray-700 transition"
                    id="edit-profile-toggle"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  
                  {/* FULL NAME */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-medium"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        id="profile-edit-name"
                      />
                    </div>
                  </div>

                  {/* PHONE */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                        <Phone className="h-4 w-4" />
                      </span>
                      <input
                        type="tel"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-medium font-mono"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        id="profile-edit-phone"
                      />
                    </div>
                  </div>

                  {/* SHIPPING ADDRESS */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipping Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-medium"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        id="profile-edit-address"
                      />
                    </div>
                  </div>

                  {/* CITY & PINCODE */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">City</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                          <Building2 className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          required
                          className="w-full pl-10 pr-4 py-2 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-medium"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          id="profile-edit-city"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Pin Code</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                          <Map className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          className="w-full pl-10 pr-4 py-2 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-medium font-mono"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                          id="profile-edit-pincode"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2.5 text-xs font-bold text-gray-400 bg-gray-900 border border-gray-800 hover:bg-gray-800 hover:text-white rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-md transition flex items-center justify-center gap-1.5"
                      id="profile-edit-save"
                    >
                      {updating ? 'Saving Changes...' : (
                        <>
                          <Check className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>

                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#16181a] p-5 rounded-lg border border-gray-800">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Account Full Name</span>
                    <p className="text-sm font-bold text-white">{currentCustomer.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Phone Number</span>
                    <p className="text-sm font-semibold text-emerald-400 font-mono">{currentCustomer.phone}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2 border-t border-gray-800/60 pt-3 mt-1">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Registered Email</span>
                    <p className="text-xs font-mono text-gray-300">{currentCustomer.email}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2 border-t border-gray-800/60 pt-3 mt-1">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Default Delivery Address</span>
                    <p className="text-xs text-gray-300 font-medium">
                      {currentCustomer.shippingAddress}, {currentCustomer.city} - <strong className="font-mono text-emerald-400">{currentCustomer.pincode}</strong>
                    </p>
                  </div>
                  <div className="md:col-span-2 border-t border-gray-800/60 pt-3 mt-2 flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Your account credentials are secured and encrypted.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">Your Past Orders</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    View order summaries, tracked delivery status, and invoice breakdowns below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadOrders}
                  className="p-1.5 text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 rounded border border-gray-800 transition"
                  title="Refresh Orders List"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingOrders ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Syncing Past Transactions...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-gray-800 rounded-xl text-center space-y-3 bg-[#131517]">
                  <ShoppingBag className="h-10 w-10 text-gray-600 mx-auto" />
                  <div>
                    <p className="text-sm font-extrabold text-gray-300">No Orders Placed Yet</p>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-normal">
                      When you place an order using our modern checkout delivery flow, it will be catalogued live here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div 
                        key={order.id} 
                        className="bg-[#151719] border border-gray-800 hover:border-gray-700 rounded-lg overflow-hidden transition duration-150"
                      >
                        
                        {/* Summary Header */}
                        <div 
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                        >
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-white uppercase tracking-wider font-mono">
                                #{order.id}
                              </span>
                              <span className="text-[10px] text-gray-500 font-medium font-mono">
                                {orderDate}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'} •{' '}
                              <strong className="text-white font-bold">₹{order.totalAmount.toFixed(2)}</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t border-gray-800/80 bg-black/25 p-4 space-y-4 animate-in slide-in-from-top-1 duration-150">
                            
                            {/* Products summary list */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Items in Order</span>
                              <div className="space-y-1.5">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-gray-900/40">
                                    <div className="flex items-center gap-2.5">
                                      {item.image ? (
                                        <img src={item.image} alt={item.name} className="h-6 w-6 object-contain rounded bg-white/5" referrerPolicy="no-referrer" />
                                      ) : (
                                        <div className="h-6 w-6 rounded bg-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-500">IMG</div>
                                      )}
                                      <span className="text-gray-300 font-medium">
                                        {item.name} <span className="text-gray-500 text-[10px]">({item.unit})</span>
                                      </span>
                                    </div>
                                    <span className="text-gray-400 font-mono">
                                      {item.quantity} x ₹{item.price.toFixed(2)} = <strong className="text-gray-200 font-bold">₹{(item.quantity * item.price).toFixed(2)}</strong>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delivery & Payout Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1 border-t border-gray-800/60">
                              <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Delivery Logistics</span>
                                <p className="text-gray-300 font-medium capitalize">{order.deliveryType} Delivery</p>
                                <p className="text-gray-400 text-[11px] leading-relaxed max-w-xs">{order.customerAddress}</p>
                              </div>

                              <div className="space-y-1.5 bg-[#17191b] p-3 rounded-lg border border-gray-800/40 text-right">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-gray-400">Total Amount:</span>
                                  <span className="font-bold text-white font-mono">₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                                {order.savings > 0 && (
                                  <div className="flex justify-between text-[11px] text-emerald-400 font-bold">
                                    <span>Your Mega Savings:</span>
                                    <span className="font-mono">₹{order.savings.toFixed(2)}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
