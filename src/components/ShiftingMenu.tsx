import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, ShoppingCart, Store, MapPin, LogOut, ChevronRight, HelpCircle, UserCheck } from 'lucide-react';
import { Customer } from '../types';

interface ShiftingMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentCustomer: Customer | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAccount: () => void;
  currentPincode: string;
  onOpenPincodeModal: () => void;
}

export default function ShiftingMenu({
  isOpen,
  onClose,
  isAdmin,
  setIsAdmin,
  cartCount,
  onOpenCart,
  currentCustomer,
  onOpenAuth,
  onLogout,
  onOpenAccount,
  currentPincode,
  onOpenPincodeModal,
}: ShiftingMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
            id="shifting-menu-backdrop"
          />

          {/* Sliding Menu Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col font-sans text-gray-800 border-l border-emerald-100"
            id="shifting-menu-drawer"
          >
            {/* Menu Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between shadow-md">
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight italic flex items-center">
                  Bari'
                  <span className="text-yellow-400 font-extrabold not-italic ml-1">All-In-One Mart</span>
                </span>
                <span className="text-[10px] text-yellow-300 italic font-medium">
                  Main Store Navigation Menu
                </span>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition border border-white/10 focus:outline-none"
                id="shifting-menu-close-btn"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Menu Body - Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" id="shifting-menu-body">
              
              {/* Profile / Account Section */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 shadow-xs">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <User className="h-3 w-3 text-emerald-700" /> Account & Profile
                </h4>
                
                {currentCustomer ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                      <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold uppercase text-sm shadow-sm">
                        {currentCustomer.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-sm text-gray-900 truncate">
                          {currentCustomer.fullName}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {currentCustomer.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          onOpenAccount();
                          onClose();
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-850 font-bold text-xs rounded-lg transition"
                        id="shifting-menu-account"
                      >
                        <span className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-emerald-700" />
                          My Profile & Order History
                        </span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          onLogout();
                          onClose();
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-lg transition"
                        id="shifting-menu-logout"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="h-4 w-4 text-rose-500" />
                          Sign Out Account
                        </span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Log in or sign up to save products in your cart, check out orders instantly, and track shipment status.
                    </p>
                    <button
                      onClick={() => {
                        onOpenAuth();
                        onClose();
                      }}
                      className="w-full py-2.5 bg-emerald-850 hover:bg-emerald-950 text-white font-extrabold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                      id="shifting-menu-login-btn"
                    >
                      <User className="h-4 w-4" />
                      Sign In / Register Account
                    </button>
                  </div>
                )}
              </div>

              {/* Shopping Cart Section */}
              {!isAdmin && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 shadow-xs">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <ShoppingCart className="h-3 w-3 text-emerald-700" /> Your Shopping Basket
                  </h4>
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-gray-200/60 shadow-2xs mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                        🛒
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Total Items Added</p>
                        <p className="text-[11px] text-gray-500">
                          {cartCount > 0 ? `${cartCount} items ready to order` : 'Your cart is empty'}
                        </p>
                      </div>
                    </div>
                    {cartCount > 0 && (
                      <span className="bg-yellow-400 text-gray-900 text-xs font-black h-6 min-w-6 px-1.5 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onOpenCart();
                      onClose();
                    }}
                    className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-extrabold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-2 border border-yellow-500"
                    id="shifting-menu-cart-btn"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Open Cart Drawer
                  </button>
                </div>
              )}

              {/* Store Administration Section */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 shadow-xs">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Store className="h-3 w-3 text-emerald-700" /> Administrative Access
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  Switch view to manage stock inventory, configure prices, add products, view full store customer logs, and update order statuses.
                </p>
                <button
                  onClick={() => {
                    setIsAdmin(!isAdmin);
                    onClose();
                  }}
                  className={`w-full py-2.5 flex items-center justify-center gap-2 font-extrabold text-xs rounded-lg transition-all duration-200 border ${
                    isAdmin
                      ? 'bg-yellow-400 text-gray-900 border-yellow-500 hover:bg-yellow-500 shadow-sm'
                      : 'bg-white text-emerald-850 border-gray-200 hover:bg-gray-50 hover:text-emerald-950'
                  }`}
                  id="shifting-menu-admin-toggle"
                >
                  <Store className="h-4 w-4" />
                  {isAdmin ? 'Switch to Customer View' : 'Access Store Admin Panel'}
                </button>
              </div>

              {/* Delivery Pincode Indicator (Handy shortcut) */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 shadow-xs">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-emerald-700" /> Delivery Zone
                </h4>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200/60 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-yellow-500" />
                    <div className="text-xs">
                      <p className="text-gray-400 text-[9px] leading-tight uppercase">Current Pincode</p>
                      <p className="font-extrabold text-gray-800 leading-normal font-mono">{currentPincode}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded uppercase">
                    Service Active
                  </span>
                </div>
                <button
                  onClick={() => {
                    onOpenPincodeModal();
                    onClose();
                  }}
                  className="w-full py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                  id="shifting-menu-pincode-btn"
                >
                  Change Delivery Pincode
                </button>
              </div>

            </div>

            {/* Menu Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 text-center space-y-2">
              <p className="text-[10px] text-gray-400">
                Bari' All-In-One Mart • Local Grocery Partner v1.2
              </p>
              <div className="flex justify-center gap-3 text-xs text-gray-400">
                <span className="hover:underline cursor-pointer flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" /> Help Desk
                </span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">Terms</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">Privacy</span>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
