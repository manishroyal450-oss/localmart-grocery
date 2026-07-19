import React from 'react';
import { MessageCircle, X, Send, Check, ShieldAlert, ChevronUp, ChevronDown } from 'lucide-react';
import { Customer } from '../types';

interface WhatsAppWidgetProps {
  currentCustomer: Customer | null;
}

export default function WhatsAppWidget({ currentCustomer }: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [showTooltip, setShowTooltip] = React.useState(true);

  // Suggested quick messages
  const QUICK_MESSAGES = [
    "🚚 Track my recent order status",
    "🍎 Inquire about vegetable freshness",
    "💼 Want to register as a local delivery boy",
    "🎟️ Is there a first-time user discount coupon?"
  ];

  React.useEffect(() => {
    // Hide tooltip after 6 seconds automatically
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendWhatsApp = (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const messageToSend = customMsg || message || "Hello! I am visiting Bari' All-In-One Mart and need support.";
    
    // Auto append user identification if logged in
    let finalMsg = messageToSend;
    if (currentCustomer) {
      finalMsg += `\n\n(Customer details: ${currentCustomer.fullName}, Phone: ${currentCustomer.phone})`;
    }

    const encodedText = encodeURIComponent(finalMsg);
    // WhatsApp URL API (Demonstrating direct merchant connect link)
    const whatsappUrl = `https://wa.me/917500236520?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
    setMessage('');
    setIsOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3" id="whatsapp-popup-container">
      
      {/* 1. Nice Auto-Expiring Notification Tooltip */}
      {showTooltip && !isOpen && (
        <div className="bg-[#111315] border border-gray-800 text-gray-200 text-xs py-2 px-3.5 rounded-lg shadow-xl flex items-center gap-2 max-w-xs animate-bounce" id="whatsapp-tooltip">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span className="font-semibold text-[11px]">💬 Need instant help? Chat on WhatsApp!</span>
          <button 
            onClick={() => setShowTooltip(false)} 
            className="text-gray-500 hover:text-white p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* 2. Interactive Chat Box Popup Panel */}
      {isOpen && (
        <div className="w-80 md:w-88 bg-[#111315] border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-gray-200 animate-in fade-in slide-in-from-bottom-5 duration-200" id="whatsapp-chatbox">
          
          {/* Header */}
          <div className="bg-[#075e54] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-base">
                  🟢
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#075e54]" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-white">Bari' Mart Live</h4>
                <p className="text-[10px] text-emerald-100">Usually replies in under 5 minutes</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Welcome Messages Space */}
          <div className="p-4 bg-[#0b141a]/95 space-y-4 max-h-64 overflow-y-auto text-left">
            <div className="bg-[#202c33] text-gray-100 p-3 rounded-lg text-xs leading-relaxed max-w-[85%] border-l-4 border-emerald-500">
              <p className="font-semibold text-[10px] text-emerald-400 mb-0.5">SUPPORT AGENT</p>
              <p>Hey there! 👋 Welcome to <strong className="text-emerald-400">Bari' All-In-One Mart Support</strong>. How can we help you today with your fresh grocery order?</p>
            </div>

            {currentCustomer && (
              <div className="bg-[#128c7e]/20 text-emerald-300 p-2.5 rounded-lg text-[10px] font-bold flex items-center gap-2 border border-emerald-500/20">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>Identified as logged-in Customer: {currentCustomer.fullName}</span>
              </div>
            )}

            {/* Quick Messages */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Quick inquiries</p>
              <div className="flex flex-col gap-1.5">
                {QUICK_MESSAGES.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendWhatsApp(undefined, msg)}
                    className="text-left text-[11px] p-2 bg-gray-900/60 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded text-gray-300 hover:text-white transition"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Form footer */}
          <form onSubmit={handleSendWhatsApp} className="p-3 bg-[#1e2428] flex gap-2 border-t border-gray-800">
            <input
              type="text"
              placeholder="Type your query..."
              className="flex-1 px-3 py-1.5 bg-[#2a3942] border border-transparent rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-gray-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              id="whatsapp-chatbox-input"
            />
            <button
              type="submit"
              className="p-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-lg shadow transition duration-150 active:scale-95 shrink-0"
              id="whatsapp-chatbox-submit"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}

      {/* 3. Floating Circular Buttons Stack */}
      <div className="flex flex-col items-center gap-2.5" id="floating-buttons-stack">
        {!isOpen && (
          <>
            {/* Scroll Up Button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="h-12 w-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 active:scale-90 transition-all duration-200 cursor-pointer"
              id="scroll-to-top-btn"
              title="Scroll to Top"
            >
              <ChevronUp className="h-6 w-6 text-gray-850 stroke-[3.5]" />
            </button>

            {/* Scroll Down Button */}
            <button
              type="button"
              onClick={scrollToBottom}
              className="h-12 w-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-800 shadow-lg hover:shadow-xl hover:bg-gray-50 active:scale-90 transition-all duration-200 cursor-pointer"
              id="scroll-to-bottom-btn"
              title="Scroll to Bottom"
            >
              <ChevronDown className="h-6 w-6 text-gray-850 stroke-[3.5]" />
            </button>
          </>
        )}

        {/* Floating Circular Green Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform active:scale-95 z-50 ${
            isOpen ? 'bg-rose-600 hover:bg-rose-500 rotate-90' : 'bg-[#25D366] hover:bg-[#22c35e] hover:shadow-emerald-500/10'
          }`}
          id="whatsapp-floating-btn"
          title="Chat on WhatsApp"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <div className="relative">
              <MessageCircle className="h-7 w-7 fill-white/10" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"></span>
              </span>
            </div>
          )}
        </button>
      </div>

    </div>
  );
}
