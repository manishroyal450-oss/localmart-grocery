import React from 'react';
import { Smartphone, Download, Sparkles, ExternalLink } from 'lucide-react';

export const DOWNLOAD_APP_URL = 'https://friends-forever-app-cafe.lovable.app';

export const DownloadAppBanner: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 pt-2 pb-1">
      <a
        id="btn-download-app-banner"
        href={DOWNLOAD_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white shadow-md hover:shadow-xl hover:shadow-rose-500/25 transition-all duration-300 border border-white/20 overflow-hidden active:scale-[0.99] cursor-pointer"
        title="Download Friends 4 Ever Cafe Mobile App"
      >
        {/* Subtle background glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Left: App Icon + Descriptive Text */}
        <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-black tracking-tight text-white leading-tight">
                Friends 4 Ever Cafe App
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-white/25 text-[10px] font-extrabold uppercase tracking-wider text-amber-100">
                <Sparkles className="w-2.5 h-2.5 text-amber-200" />
                Fast Order
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-white/90 truncate font-medium">
              Install app for fast ordering & exclusive offers!
            </p>
          </div>
        </div>

        {/* Right: Prominent Download App Button */}
        <div className="relative z-10 flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-white text-rose-600 group-hover:bg-amber-50 group-hover:text-rose-700 font-black text-xs sm:text-sm shadow-md transition-all duration-200 group-hover:shadow-lg">
            <Download className="w-4 h-4 text-rose-600 animate-bounce" />
            <span>Download App</span>
            <ExternalLink className="w-3 h-3 text-rose-400 sm:inline hidden" />
          </span>
        </div>
      </a>
    </div>
  );
};

export default DownloadAppBanner;
