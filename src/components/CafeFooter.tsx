import React from 'react';
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Navigation,
  Coffee,
  ExternalLink,
} from 'lucide-react';
import { GOOGLE_MAPS_URL, CAFE_FULL_ADDRESS } from './ZomatoHeader';
import { CAFE_WHATSAPP_PHONE } from '../services/googleAppsScriptService';

interface CafeFooterProps {
  onCategorySelect?: (category: string) => void;
  onOpenCart?: () => void;
  onOpenAdmin?: () => void;
}

export const CafeFooter: React.FC<CafeFooterProps> = ({
  onCategorySelect,
  onOpenAdmin,
}) => {
  const currentYear = new Date().getFullYear();

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      'Hello Friends 4 Ever Coffee Cafe! I would like to inquire about your menu and place an order.'
    );
    window.open(`https://wa.me/${CAFE_WHATSAPP_PHONE}?text=${text}`, '_blank');
  };

  return (
    <footer
      id="cafe-footer"
      className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-14 pt-12 pb-24 sm:pb-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-stone-800">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight leading-tight">
                    Friends 4 Ever Coffee Cafe
                  </h3>
                  <p className="text-xs font-medium text-stone-400">
                    Chandpur · Uttar Pradesh 246725
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-stone-400 leading-relaxed">
                Chandpur's destination for freshly brewed coffee, stone-baked pizzas, crispy burgers, thick shakes, and 100% Pure Veg cafe delicacies.
              </p>

              <p className="mt-4 text-xs font-medium text-stone-300">
                100% Pure Veg · Freshly Prepared · Hygienic Kitchen
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800">
              <button
                type="button"
                onClick={handleWhatsAppContact}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Column 2: Contact, Hours & Category Shortcuts */}
          <div className="lg:col-span-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100 mb-4">
                Visit & Contact
              </h4>

              <div className="space-y-4 text-xs text-stone-300">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Opening Hours</p>
                    <p className="text-stone-400 tabular-nums mt-0.5">
                      Daily · 10:00 AM – 10:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Phone & Orders</p>
                    <a
                      href="tel:+919719852037"
                      className="text-stone-300 hover:text-white transition-colors font-mono font-semibold tabular-nums mt-0.5 inline-block"
                    >
                      +91 97198 52037
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Cafe Address</p>
                    <p className="text-stone-400 leading-relaxed mt-0.5">
                      {CAFE_FULL_ADDRESS}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
                Popular Categories
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['Coffee', 'Pizza', 'Burger', 'Shakes', 'Noodles', 'Drinks'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onCategorySelect?.(cat);
                      window.scrollTo({ top: 320, behavior: 'smooth' });
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 hover:text-white text-stone-300 transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Google Map */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100">
                Location Map
              </h4>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                title="Open in Google Maps App"
              >
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative w-full rounded-2xl overflow-hidden border border-stone-800 bg-stone-800">
              <iframe
                title="Friends 4 Ever Coffee Cafe Location Map"
                src="https://maps.google.com/maps?q=Friends%204%20Ever%20Coffee%20Cafe%2C%20Chandpur%20-%20Dattiyana%20Rd%2C%20Chandpur%2C%20Saraishekh%20Habib%2C%20Uttar%20Pradesh%20246725&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-56 sm:h-60"
              />

              <div className="bg-stone-950/90 px-3.5 py-2.5 border-t border-stone-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    Friends 4 Ever Coffee Cafe
                  </p>
                  <p className="text-[11px] text-stone-400 truncate">
                    Saraishekh Habib, Chandpur · UP 246725
                  </p>
                </div>

                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shrink-0 inline-flex items-center gap-1 active:scale-95 transition-colors"
                  title="Navigate with GPS"
                >
                  <Navigation className="w-3 h-3 fill-white" />
                  <span>Navigate</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Copyright Footer Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <p>Friends 4 Ever Coffee Cafe · Chandpur</p>
          <div className="flex items-center gap-4">
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="text-xs font-semibold text-stone-300 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                Admin Panel
              </button>
            )}
            <p className="text-center sm:text-right">
              © {currentYear} Friends 4 Ever Coffee Cafe. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CafeFooter;
