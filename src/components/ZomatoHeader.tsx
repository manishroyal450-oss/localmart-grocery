import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Search,
  Mic,
  MicOff,
  X,
  ExternalLink,
  User,
  Volume2,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  Home,
  ShoppingCart,
} from 'lucide-react';
import { UserProfile } from '../services/authService';

interface ZomatoHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser?: UserProfile | null;
  onOpenProfile?: () => void;
  onGoHome?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
  activeTab?: 'home' | 'cart' | 'profile';
  vegOnly?: boolean;
  onToggleVegOnly?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CAFE_FULL_ADDRESS =
  'Chandpur - Dattiyana Rd, Chandpur, Saraishekh Habib, Uttar Pradesh 246725';
export const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `Friends 4 Ever Coffee Cafe, ${CAFE_FULL_ADDRESS}`
)}`;

export const ZomatoHeader: React.FC<ZomatoHeaderProps> = ({
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenProfile,
  onGoHome,
  onOpenCart,
  cartCount = 0,
  activeTab = 'home',
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micStatusMsg, setMicStatusMsg] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Clean up recognition instance on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleToggleVoiceSearch = () => {
    // If currently listening, stop
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      setMicStatusMsg(null);
      return;
    }

    // Reset error state on every click so user can retry immediately
    setPermissionDenied(false);
    setMicStatusMsg(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // If Web Speech API not present, try native getUserMedia
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            stream.getTracks().forEach((track) => track.stop());
            setMicStatusMsg('Microphone access granted! Please type your search.');
            setTimeout(() => setMicStatusMsg(null), 4000);
          })
          .catch(() => {
            setPermissionDenied(true);
            setMicStatusMsg('Microphone permission blocked in browser settings.');
          });
      } else {
        setMicStatusMsg('Voice search not supported in this browser. Please type to search.');
        setTimeout(() => setMicStatusMsg(null), 4000);
      }
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setPermissionDenied(false);
        setMicStatusMsg('Listening... Boliyen (e.g. "Burger", "Pizza", "Coffee")');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        if (transcript) {
          onSearchChange(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionDenied(true);
          setMicStatusMsg('Microphone permission block hai. Niche "Enable Permission" ya browser settings me allow karein.');
        } else if (event.error === 'no-speech') {
          setMicStatusMsg('Kuch sunai nahi diya. Dubara mic dabakar bolen.');
          setTimeout(() => setMicStatusMsg(null), 3500);
        } else {
          setMicStatusMsg(`Voice search: ${event.error}`);
          setTimeout(() => setMicStatusMsg(null), 3500);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => {
          setMicStatusMsg((prev) => (prev?.startsWith('Listening') ? null : prev));
        }, 1500);
      };

      // Call start directly within the user click gesture
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition directly:', err);
      setIsListening(false);
      setPermissionDenied(true);
      setMicStatusMsg('Permission blocked. Browser setting me mic allow karein.');
    }
  };

  const handleRequestMediaPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setPermissionDenied(false);
        setMicStatusMsg('Permission Allowed! Mic par click karke bolna shuru karein.');
        setTimeout(() => setMicStatusMsg(null), 4000);
      } else {
        handleToggleVoiceSearch();
      }
    } catch (err) {
      setPermissionDenied(true);
      setMicStatusMsg('Chrome me URL bar ke pass 🔒/ⓘ tap karein -> Permissions -> Microphone "Allow" karein.');
    }
  };

  const handleOpenStandaloneTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs w-full max-w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 pt-3 pb-2.5">
        {/* Top Location Link to Google Maps + Profile Section */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            title={`Click to open Google Maps: ${CAFE_FULL_ADDRESS}`}
            className="group flex items-start gap-2.5 min-w-0 flex-1 p-1 rounded-xl hover:bg-stone-50 active:bg-stone-100 transition-all cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-full bg-rose-50 group-hover:bg-rose-100 border border-rose-200/80 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-all">
              <MapPin className="w-4 h-4 text-rose-600 group-hover:text-rose-700 animate-bounce [animation-duration:2s]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm xs:text-base sm:text-lg font-black text-stone-900 group-hover:text-rose-600 transition-colors leading-tight">
                  Friends 4 Ever Coffee Cafe
                </h1>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md flex-shrink-0">
                  <span>Maps</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 group-hover:text-stone-700 truncate font-medium flex items-center gap-1">
                <span>Chandpur - Dattiyana Rd, Chandpur</span>
                <span>•</span>
                <span className="text-rose-600 font-semibold underline decoration-rose-300 underline-offset-2">
                  Open Location
                </span>
              </p>
            </div>
          </a>

          {/* Profile / Account Action Button */}
          <button
            type="button"
            onClick={onOpenProfile}
            id="header-profile-btn"
            className="flex-shrink-0 flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full bg-white hover:bg-rose-50/70 border border-stone-200 hover:border-rose-300 shadow-2xs transition-all cursor-pointer group active:scale-95 ml-2"
            title={
              currentUser
                ? `Logged in as ${currentUser.fullName} (Click to view profile)`
                : 'Log In / Sign Up'
            }
          >
            {currentUser ? (
              <>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-rose-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left leading-tight hidden md:block">
                  <span className="text-xs font-bold text-stone-900 group-hover:text-rose-600 block truncate max-w-[95px]">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    Profile
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors flex items-center justify-center border border-rose-200">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-stone-800 group-hover:text-rose-600 hidden sm:inline mr-1">
                  Login
                </span>
              </>
            )}
          </button>
        </div>

        {/* Zomato-style Search Bar with Functional Voice Search */}
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-600">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <input
            id="zomato-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isListening
                ? 'Listening... Boliyen (e.g. "Pizza", "Cold Coffee")'
                : 'Search "burger", "pizza", "coffee", "shakes"...'
            }
            className={`w-full pl-10 pr-20 py-2.5 sm:py-3 rounded-xl bg-stone-50 hover:bg-stone-100/80 focus:bg-white border text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm font-medium shadow-2xs focus:outline-none transition-all ${
              isListening
                ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 placeholder:text-rose-600 placeholder:font-bold'
                : 'border-stone-200 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500'
            }`}
          />

          {/* Right Action Icons: Clear & Mic */}
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                title="Clear search"
              >
                <div className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center">
                  <X className="w-2.5 h-2.5 text-stone-600" />
                </div>
              </button>
            )}

            {/* Interactive Mic Button */}
            <button
              type="button"
              onClick={handleToggleVoiceSearch}
              className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-md ring-4 ring-rose-200 scale-110'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 active:scale-90'
              }`}
              title={
                isListening
                  ? 'Listening... Click to stop voice search'
                  : 'Search by Voice (Click to enable Mic)'
              }
            >
              {isListening ? (
                <Volume2 className="w-4 h-4 animate-bounce" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Live Mic Status Indicator / Prompt with Action Buttons */}
        {micStatusMsg && (
          <div className="mt-2 p-2 sm:p-2.5 rounded-xl bg-stone-900 text-white text-[11px] sm:text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1 shadow-lg border border-stone-800 w-full max-w-full overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              {isListening ? (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span className="leading-snug">{micStatusMsg}</span>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
              {permissionDenied && (
                <>
                  <button
                    type="button"
                    onClick={handleRequestMediaPermission}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Try Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenStandaloneTab}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium border border-stone-700 active:scale-95 transition-all cursor-pointer"
                    title="Open app in full browser tab for native mic permission"
                  >
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                    <span>New Tab</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setMicStatusMsg(null);
                  setPermissionDenied(false);
                }}
                className="text-stone-400 hover:text-white p-1 rounded-md text-xs hover:bg-stone-800 ml-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default ZomatoHeader;
