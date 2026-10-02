import React from 'react';
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  CheckCircle2,
  Navigation,
  Coffee,
  Heart,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UtensilsCrossed,
} from 'lucide-react';
import { GOOGLE_MAPS_URL, CAFE_FULL_ADDRESS } from './ZomatoHeader';
import { CAFE_WHATSAPP_PHONE } from '../services/googleAppsScriptService';

interface CafeFooterProps {
  onCategorySelect?: (category: string) => void;
  onOpenCart?: () => void;
}

export const CafeFooter: React.FC<CafeFooterProps> = ({
  onCategorySelect,
  onOpenCart,
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
      className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-16 pt-12 pb-28 sm:pb-24 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid: Brand Info, Contact & Hours, Interactive Google Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-stone-800">
          
          {/* Column 1: Brand, Tagline & Pure Veg Certified (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              {/* Brand Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/30">
                  <Coffee className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
                    Friends 4 Ever
                  </h3>
                  <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                    Coffee Cafe • Chandpur
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-stone-400 leading-relaxed">
                Chandpur's favorite cafe for handcrafted coffee, sizzling pizzas, crispy burgers, creamy shakes, and delicious 100% Pure Veg quick bites.
              </p>

              {/* Quality & Trust Badges */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs font-bold">
                  <div className="w-2.5 h-2.5 rounded-xs border border-emerald-400 flex items-center justify-center p-0.5 bg-white">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </div>
                  100% Pure Veg
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Fresh Prep
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-300 text-xs font-bold">
                  <ShieldCheck className="w-3 h-3 text-rose-400" />
                  Hygienic Kitchen
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Callout Button */}
            <div className="mt-6 pt-4 border-t border-stone-850">
              <button
                type="button"
                onClick={handleWhatsAppContact}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat & Order on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Column 2: Contact, Timings & Quick Navigation (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-100 flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>Visit & Contact Info</span>
              </h4>

              <div className="space-y-3.5 text-xs text-stone-300">
                {/* Timings */}
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Opening Hours</p>
                    <p className="text-stone-400">Open Everyday: 10:00 AM – 10:00 PM</p>
                    <span className="inline-block mt-1 text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-md font-bold">
                      Open Today for Dine-in & Pickup
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Phone & Orders</p>
                    <a
                      href="tel:+919719852037"
                      className="text-stone-300 hover:text-white transition-colors font-mono font-bold"
                    >
                      +91 97198 52037
                    </a>
                  </div>
                </div>

                {/* Full Address */}
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Cafe Location</p>
                    <p className="text-stone-400 leading-relaxed">
                      {CAFE_FULL_ADDRESS}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Category Shortcuts */}
            <div className="mt-6 pt-4 border-t border-stone-850">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                Popular Menu Items
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['Coffee', 'Pizza', 'Burger', 'Shakes', 'Noodles', 'Drinks'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onCategorySelect?.(cat);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 hover:text-white text-stone-300 transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Professional Google Map (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-100 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-rose-500" />
                <span>Find Us On Google Maps</span>
              </h4>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
                title="Open in Google Maps App"
              >
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Interactive Embedded Google Map */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-stone-800 shadow-xl bg-stone-850 group">
              <iframe
                title="Friends 4 Ever Coffee Cafe Location Map"
                src="https://maps.google.com/maps?q=Friends%204%20Ever%20Coffee%20Cafe%2C%20Chandpur%20-%20Dattiyana%20Rd%2C%20Chandpur%2C%20Saraishekh%20Habib%2C%20Uttar%20Pradesh%20246725&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-56 sm:h-60 filter contrast-[1.05] brightness-95 group-hover:brightness-100 transition-all duration-300"
              />

              {/* Floating Bottom Card Over Map */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-stone-900/90 backdrop-blur-md p-2.5 rounded-xl border border-stone-700/60 flex items-center justify-between gap-2 shadow-lg">
                <div className="min-w-0 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-500 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">
                      Friends 4 Ever Coffee Cafe
                    </p>
                    <p className="text-[10px] text-stone-400 truncate">
                      Chandpur - Dattiyana Rd, Chandpur
                    </p>
                  </div>
                </div>

                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                  title="Navigate with GPS"
                >
                  <Navigation className="w-3 h-3 fill-white" />
                  <span>Navigate</span>
                </a>
              </div>
            </div>

            <p className="mt-2 text-[10px] text-stone-500 flex items-center justify-between">
              <span>📍 Saraishekh Habib, Chandpur, UP 246725</span>
              <span>Coordinates Verified • 2-Wheeler & Car Parking</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Live Google Sheet Sync Indicator */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p>
              Live Digital Menu connected with Google Sheets • Real-time Updates & Orders
            </p>
          </div>

          <p className="text-center sm:text-right">
            © {currentYear} Friends 4 Ever Coffee Cafe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default CafeFooter;
