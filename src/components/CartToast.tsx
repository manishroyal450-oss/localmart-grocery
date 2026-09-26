import React, { useEffect, useState } from 'react';
import { ShoppingCart, CheckCircle, X, ArrowRight } from 'lucide-react';
import { MenuItem } from '../types';
import { getItemImageUrl } from '../services/menuService';

export interface ToastPayload {
  id: number;
  item: MenuItem;
  variant?: string;
  price: number;
  quantityAdded?: number;
  totalCartItems: number;
  cartTotalAmount: number;
}

interface CartToastProps {
  toast: ToastPayload | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export const CartToast: React.FC<CartToastProps> = ({ toast, onClose, onOpenCart }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const imageUrl = getItemImageUrl(toast.item);

  return (
    <div
      id="cart-notification-toast"
      className={`fixed z-50 transition-all duration-300 transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      } top-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md`}
    >
      <div className="bg-stone-900/95 text-white backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-stone-800 flex items-center gap-3">
        {/* Thumbnail Image */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-800 flex-shrink-0 border border-stone-700">
          <img
            src={imageUrl}
            alt={toast.item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 shadow-xs">
            <CheckCircle className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <ShoppingCart className="w-3 h-3 text-emerald-400" />
              Added to Cart! 🛒
            </span>
          </div>

          <p className="text-xs sm:text-sm font-black text-white truncate leading-tight mt-0.5">
            {toast.item.name}
          </p>

          <p className="text-[11px] text-stone-300 font-medium truncate mt-0.5">
            {toast.variant && toast.variant !== 'Standard' ? `${toast.variant} • ` : ''}
            <span className="font-bold text-amber-400">₹{toast.price}</span>
            <span className="text-stone-400 mx-1.5">|</span>
            <span className="text-stone-300">
              Cart: {toast.totalCartItems} {toast.totalCartItems === 1 ? 'item' : 'items'} (₹{toast.cartTotalAmount})
            </span>
          </p>
        </div>

        {/* Action Button: View Cart */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCart();
            }}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 250);
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartToast;
