import React from 'react';
import { ChevronRight, ArrowUpDown, Tag, Percent, Sparkles, Upload, Image as ImageIcon, Search, X, ChevronLeft, Camera, Loader2, Mic, MicOff } from 'lucide-react';
import { Product, CATEGORIES, CategoryType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ProductPlaceholderImage from './ProductPlaceholderImage';
import storefrontImg from '../assets/images/bari_storefront_1784447298609.jpg';

const getSerialNumber = (id: string) => {
  const match = id.match(/\d+/);
  return match ? match[0] : '';
};

interface GroceryCatalogProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  cart: { [productId: string]: number };
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
  onUpdateProductImage: (productId: string, base64Image: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onProductClick?: (product: Product) => void;
  isAdmin?: boolean;
  onOpenRestaurant?: () => void;
}

export default function GroceryCatalog({
  products,
  selectedCategory,
  setSelectedCategory,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateProductImage,
  searchQuery,
  setSearchQuery,
  onProductClick,
  isAdmin = false,
  onOpenRestaurant,
}: GroceryCatalogProps) {
  const [sortBy, setSortBy] = React.useState<'popular' | 'priceAsc' | 'priceDesc' | 'discount'>('popular');
  const fileInputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Lens/Camera visual search states
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [cameraStream, setCameraStream] = React.useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanError, setScanError] = React.useState<string | null>(null);
  
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);

  // Voice/Mic search states
  const [isVoiceModalOpen, setIsVoiceModalOpen] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [voiceError, setVoiceError] = React.useState<string | null>(null);
  const [recognition, setRecognition] = React.useState<any>(null);

  React.useEffect(() => {
    return () => {
      if (recognition) {
        try {
          recognition.abort();
        } catch (e) {}
      }
    };
  }, [recognition]);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Voice search is not supported on your current browser. Please try Google Chrome, Apple Safari, or MS Edge.");
      return;
    }

    try {
      if (recognition) {
        try {
          recognition.abort();
        } catch (e) {}
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN'; // Optimized for general/Indian English. Supports Hindi words well!

      rec.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setVoiceError("Microphone access is blocked. Browsers restrict microphone access inside sandbox iframes (like the AI Studio editor preview frame). To try voice search, click the 'Open in New Tab' button in the top-right corner of the preview panel, or type the item name directly below.");
        } else if (event.error === 'no-speech') {
          setVoiceError("No speech detected. Please speak clearly into your microphone.");
        } else {
          setVoiceError(`Error: ${event.error}. Please ensure mic is connected and try again.`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          const cleanTranscript = transcript.trim().replace(/\.$/, '');
          setSearchQuery(cleanTranscript);
          setIsVoiceModalOpen(false);
        }
      };

      rec.start();
      setRecognition(rec);
    } catch (err: any) {
      console.error("Could not start SpeechRecognition:", err);
      setVoiceError("Failed to initiate voice recognition.");
      setIsListening(false);
    }
  };

  const stopVoiceSearch = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  // Automatically start voice search when voice modal is opened
  React.useEffect(() => {
    if (isVoiceModalOpen) {
      startVoiceSearch();
    } else {
      stopVoiceSearch();
    }
    return () => {
      stopVoiceSearch();
    };
  }, [isVoiceModalOpen]);

  // Start the video stream
  const startCamera = async () => {
    setScanError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.log("Video play error:", err));
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setScanError("Camera access permission is required to search using live camera. You can also upload a photo below.");
    }
  };

  // Stop the video stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Handle camera modal toggle
  React.useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraOpen]);

  // Analyze the base64 image data
  const analyzeImage = async (base64Image: string) => {
    setIsScanning(true);
    setScanError(null);
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      const data = await response.json();
      if (response.ok && data.keyword) {
        setSearchQuery(data.keyword);
        setIsCameraOpen(false);
      } else {
        throw new Error(data.error || "Could not detect item in image. Try another photo.");
      }
    } catch (err: any) {
      console.error("Scan error:", err);
      setScanError(err.message || "Failed to scan. Please check your internet connection and try again.");
    } finally {
      setIsScanning(false);
    }
  };

  // Capture a snapshot from the live video element
  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg', 0.85);
        analyzeImage(base64Image);
      }
    } catch (err: any) {
      console.error("Capture photo failed:", err);
      setScanError("Failed to capture image. Try uploading a photo instead.");
    }
  };

  // Handle local image file uploads for scanning
  const handleCameraFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setScanError("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        analyzeImage(base64);
      }
    };
    reader.onerror = () => {
      setScanError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  // Banner slides corresponding to user-uploaded store photos (Produce, Cheese, Wine, Bakery, Meat, etc.)
  const bannerSlides = React.useMemo(() => [
    {
      id: 1,
      image: storefrontImg,
      tag: 'NOW OPEN ON 2nd FLOOR',
      title: "Bari' All-In-One Mart",
      desc: 'Quality, Trust & Taste — All Under One Roof! Your trusted neighborhood local premium store is now open on the 2nd Floor. Explore more daily essentials, home goods, cosmetics, and toys.'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'FRESH PRODUCE',
      title: 'Farm-Fresh Fruits & Veggies',
      desc: '100% organic and hand-picked daily, supporting local farmers and sustainable agriculture.'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'CHEESE CELLAR',
      title: 'Artisanal Cheese Counter',
      desc: 'An exquisite hand-curated collection of local, raw milk, and award-winning imported cheeses.'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'BAKERY & BREAD',
      title: 'Artison Bakery & Pretzels',
      desc: 'Handcrafted sourdough loaves, giant pretzels, and butter croissants baked fresh every morning.'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1628102476629-f8c51110f241?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'WELLNESS DRINKS',
      title: 'Cold-Pressed Juices & Elixirs',
      desc: 'Recharge with refreshing organic kombucha, local mineral waters, and pure wellness shots.'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'PREPARED FOODS',
      title: 'Salad Bar & Hot Buffet',
      desc: 'Chef-prepared meals, fresh seasonal pastas, and gourmet salad bar items ready to enjoy.'
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'FINE WINES',
      title: 'Gourmet Wine & Cellar Selection',
      desc: 'A premium curated list of biodynamic, organic, and estate-bottled wines for any occasion.'
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'HOLIDAY SWEETS',
      title: 'Cakes, Cookies & Fine Sweets',
      desc: 'Indulge in our selection of rich chocolate fudges, decorative cakes, and classic cookies.'
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'PREMIUM MEATS',
      title: 'Responsibly Sourced Poultry & Cuts',
      desc: 'No-antibiotics, pasture-raised, grass-fed beef and poultry prepared daily by skilled butchers.'
    },
    {
      id: 10,
      image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1200&h=500&q=80',
      tag: 'WELLNESS & BEAUTY',
      title: 'Pure Wellness & Natural Beauty',
      desc: 'Eco-friendly personal care, botanical skincare, and health supplements for daily vitality.'
    }
  ], []);

  const [currentSlide, setCurrentSlide] = React.useState(0);

  // Auto scroll banner slides
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  // Offer banners
  const offers = [
    { id: 1, title: "Super Savings Days", desc: "Best Prices on all Pantry Staples & Rice", bg: "from-amber-500 to-orange-600", tag: "STAPLES" },
    { id: 2, title: "Farm Fresh Morning", desc: "Veggies & Fruits direct from local orchards", bg: "from-emerald-500 to-teal-600", tag: "FRESHGREEN" },
    { id: 3, title: "Dairy Deals Special", desc: "Get Fresh Milk, Butter & Paneer at best rates", bg: "from-sky-500 to-blue-600", tag: "DAIRYGOLD" }
  ];

  const [activeOffer, setActiveOffer] = React.useState(0);

  // Auto scroll offers
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveOffer((prev) => (prev + 1) % offers.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Filter and Sort products
  const processedProducts = React.useMemo(() => {
    let result = [...products];

    // Sorting
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => {
        const discA = a.originalPrice - a.price;
        const discB = b.originalPrice - b.price;
        return discB - discA;
      });
    } // 'popular' maintains server order

    return result;
  }, [products, sortBy]);

  // Handle direct image upload from card
  const handleCardImageUpload = (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    // Limit to 5MB in UI
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onUpdateProductImage(productId, base64String);
    };
    reader.readAsDataURL(file);
  };

  const getDiscountPercentage = (price: number, originalPrice: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="font-sans px-4 py-6 md:px-8 max-w-7xl mx-auto" id="grocery-catalog-section">
      
      {/* Whole Foods Storefront Hero Banner - Auto Animated Slideshow of Store Images */}
      <div className="mb-8 rounded-xl overflow-hidden relative shadow-md h-56 md:h-72 group bg-slate-950" id="store-hero-banner">
        
        {/* Animated Ticker / Warning Banner Bar at the top of the Hero Banner */}
        <div className="absolute top-0 left-0 right-0 bg-red-600/90 backdrop-blur-md text-white text-[10px] md:text-xs font-bold py-2 px-4 z-20 flex items-center overflow-hidden border-b border-red-500/30 shadow-md">
          <div className="flex items-center gap-1.5 shrink-0 bg-black/40 px-2 py-0.5 rounded text-yellow-300 mr-2 border border-red-400/25">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-extrabold uppercase tracking-widest text-[8px] md:text-[9px]">Store Policy Alert</span>
          </div>
          
          <div className="relative flex-1 overflow-hidden h-4">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-16 font-extrabold tracking-wide text-[11px] md:text-xs">
              <span className="flex items-center gap-1">
                🚫 <strong className="text-yellow-200">NO PRODUCT RETURN AFTER SALE</strong> — Please inspect and verify your items carefully before leaving the counter. Thank you!
              </span>
              <span className="flex items-center gap-1 text-teal-100">
                📢 <strong className="text-yellow-200">बिक्री के बाद कोई सामान वापस नहीं होगा</strong> — कृपया जाने से पहले सामान की अच्छी तरह जांच कर लें। धन्यवाद!
              </span>
              <span className="flex items-center gap-1">
                🚫 <strong className="text-yellow-200">NO PRODUCT RETURN AFTER SALE</strong> — Please inspect and verify your items carefully before leaving the counter. Thank you!
              </span>
              <span className="flex items-center gap-1 text-teal-100">
                📢 <strong className="text-yellow-200">बिक्री के बाद कोई सामान वापस नहीं होगा</strong> — कृपया जाने से पहले सामान की अच्छी तरह जांच कर लें। धन्यवाद!
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={bannerSlides[currentSlide].image} 
              alt={bannerSlides[currentSlide].title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Slide Content with entry animation */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10 pointer-events-none">
          <div className="max-w-xl">
            <motion.span 
              key={`tag-${currentSlide}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-emerald-700 text-white text-[10px] font-black px-2.5 py-1 rounded tracking-wider uppercase inline-block mb-2"
            >
              {bannerSlides[currentSlide].tag}
            </motion.span>
            <motion.h1 
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-2xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm"
            >
              {bannerSlides[currentSlide].title}
            </motion.h1>
            <motion.p 
              key={`desc-${currentSlide}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-xs md:text-sm text-gray-200 mt-1.5 font-medium leading-relaxed max-w-lg drop-shadow-sm"
            >
              {bannerSlides[currentSlide].desc}
            </motion.p>
          </div>
        </div>

        {/* Carousel Navigation Arrow Controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-xs transition opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer"
          title="Previous Slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-xs transition opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer"
          title="Next Slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Navigation Indicator Dots */}
        <div className="absolute bottom-4 right-6 flex gap-1.5 z-20">
          {bannerSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'bg-white w-5' : 'bg-white/40 w-1.5 hover:bg-white/70'
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Majestic Centered Google-Style Search Form */}
      <div className="max-w-2xl mx-auto mb-10 mt-2 text-center" id="google-search-section">
        {/* Brand subtitle matching Google Search Home */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 select-none">
          <span className="text-3xl md:text-4xl font-black tracking-tight font-sans animate-shimmer-text">
            Manish Royal
          </span>
          <span className="text-xs bg-emerald-900 text-yellow-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-yellow-400/40 shadow-xs animate-glow-badge">
            Web Designer • Animated UI
          </span>
        </div>
        
        {/* Rounded-full iconic search box container */}
        <div className="relative group max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-700 transition-colors" />
          </div>
          
          <input
            type="text"
            placeholder="Search catalog for fresh apples, local dairy, bread..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-24 py-3 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md focus:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-100/50 focus:border-emerald-700 text-sm text-gray-800 transition-all font-medium"
            id="google-search-input"
          />

          {/* Right Action Icons (X to clear, Mic, Lens) */}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                title="Clear Search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {searchQuery && <span className="h-5 w-[1px] bg-gray-200" />}

            {/* Google-like Mic Icon */}
            <button
              type="button"
              onClick={() => {
                setVoiceError(null);
                setIsVoiceModalOpen(true);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-50 rounded-full transition cursor-pointer"
              title="Search by voice"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="#4285F4"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="#34A853"/>
              </svg>
            </button>

            {/* Google-like Lens Camera Icon */}
            <button
              type="button"
              onClick={() => {
                setIsCameraOpen(true);
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-full transition cursor-pointer"
              title="Search by image (Lens)"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#EA4335" />
                <circle cx="12" cy="13" r="4" stroke="#FBBC05" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dynamic recommendation keywords below search */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-[11px] text-gray-500">
          <span className="font-bold uppercase text-[9px] tracking-wider text-gray-400">Popular searches:</span>
          {['Fresh Mango', 'Organic Milk', 'Brown Bread', 'Paneer'].map((keyword) => (
            <button
              key={keyword}
              type="button"
              onClick={() => setSearchQuery(keyword)}
              className="px-3 py-0.5 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200/60 rounded-full text-gray-600 transition"
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>

      {/* 🎤 Live Voice / Mic Search Modal */}
      <AnimatePresence>
        {isVoiceModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-md"
            id="voice-search-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col items-center p-6 text-white relative"
              id="voice-search-modal"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  stopVoiceSearch();
                  setIsVoiceModalOpen(false);
                }}
                className="absolute top-4 right-4 p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Title */}
              <div className="text-center mb-5 w-full">
                <span className="text-[9px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                  Voice Assistant
                </span>
                <h3 className="font-extrabold text-base tracking-tight text-white mt-1.5">
                  Speak to Search
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">What are you looking for today?</p>
              </div>

              {/* Animated Glowing Mic Section */}
              <div className="relative h-28 w-28 flex items-center justify-center mb-5">
                {isListening && (
                  <>
                    {/* Expanding Pulse Waves */}
                    <span className="absolute animate-ping inline-flex h-16 w-16 rounded-full bg-blue-500/30 opacity-75"></span>
                    <span className="absolute animate-ping [animation-delay:0.5s] inline-flex h-20 w-20 rounded-full bg-teal-500/20 opacity-40"></span>
                  </>
                )}
                
                {/* Central Mic Button */}
                <button
                  type="button"
                  onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                  className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg border transform active:scale-95 transition cursor-pointer z-10 ${
                    isListening 
                      ? 'bg-gradient-to-tr from-blue-600 to-teal-500 shadow-blue-500/30 border-blue-400/20' 
                      : 'bg-zinc-800 hover:bg-zinc-700 shadow-black border-zinc-700'
                  }`}
                  title={isListening ? "Stop listening" : "Start listening"}
                >
                  {isListening ? (
                    <Mic className="h-7 w-7 animate-pulse" />
                  ) : (
                    <MicOff className="h-7 w-7 text-zinc-400" />
                  )}
                </button>

                {/* Simulated Audio Equalizer Visualizer */}
                {isListening && (
                  <div className="absolute -bottom-2 flex items-end gap-1 h-5">
                    <span className="w-1 bg-blue-500 rounded-full animate-bounce h-2.5" />
                    <span className="w-1 bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s] h-4" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.1s] h-3.5" />
                    <span className="w-1 bg-teal-400 rounded-full animate-bounce [animation-delay:0.3s] h-4" />
                    <span className="w-1 bg-blue-500 rounded-full animate-bounce h-2.5" />
                  </div>
                )}
              </div>

              {/* Status or Search Tips */}
              <div className="text-center px-2 w-full">
                <p className={`text-xs font-bold tracking-wide mb-3 ${isListening ? 'text-blue-400 animate-pulse' : 'text-zinc-500'}`}>
                  {isListening ? 'Listening... Speak now' : 'Voice connection paused'}
                </p>
                
                {!voiceError && (
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-left">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Try saying:</p>
                    <div className="flex flex-col gap-1 text-[11px] text-zinc-300">
                      <p className="flex items-center gap-1">
                        <span className="text-blue-400 font-extrabold">“</span>Fresh Mango<span className="text-blue-400 font-extrabold">”</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="text-teal-400 font-extrabold">“</span>Syska LED Bulb<span className="text-teal-400 font-extrabold">”</span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="text-emerald-400 font-extrabold">“</span>Mother Dairy Milk<span className="text-emerald-400 font-extrabold">”</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Output & Detailed Troubleshooting */}
              {voiceError && (
                <div className="mt-4 bg-red-950/40 border border-red-900/30 text-[11px] text-red-200 p-3.5 rounded-xl w-full text-left leading-relaxed flex flex-col gap-2">
                  <div className="font-extrabold uppercase text-red-400 tracking-wider flex items-center gap-1">
                    <span>⚠️ Microphone Blocked</span>
                  </div>
                  <p className="text-zinc-300">
                    {voiceError}
                  </p>
                  <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800 text-zinc-400 text-[10px] mt-1">
                    <p className="font-bold text-zinc-300 mb-1">💡 Sandbox Workaround:</p>
                    <p>Click the <strong className="text-white">“Open in New Tab”</strong> button at the top-right corner of the app screen. Running the app in a new tab allows your browser to request standard microphone and camera permissions directly!</p>
                  </div>
                </div>
              )}

              {/* Interactive Retry & Typing Search Fallback Option */}
              <div className="mt-5 pt-4 border-t border-zinc-800 w-full flex flex-col gap-2">
                {!isListening && (
                  <button
                    onClick={startVoiceSearch}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-lg transition text-center cursor-pointer"
                  >
                    🔄 Retry Speech Recognition
                  </button>
                )}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Or type product name here..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 focus:outline-none text-xs text-white px-3 py-2 rounded-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        stopVoiceSearch();
                        setIsVoiceModalOpen(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-2 py-0.5 rounded transition cursor-pointer"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📸 Real Camera Search Modal (Google Lens style) */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-md"
            id="camera-search-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col relative text-white"
              id="camera-search-modal"
            >
              {/* Header */}
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-500/10 rounded-lg text-red-400">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                      Bari' Smart Lens <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest animate-pulse">Live</span>
                    </h3>
                    <p className="text-[10px] text-zinc-400">Point your camera at a grocery product to search</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCameraOpen(false)}
                  className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Camera Body / Viewport */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {cameraStream ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {/* Futuristic Scanning Overlay Target Frame */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-56 h-36 border-2 border-dashed border-red-500/80 rounded-xl relative flex items-center justify-center">
                        {/* Glowing Scanner Line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-[bounce_2.5s_infinite]" />
                        
                        {/* Decorative Corners */}
                        <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-4 border-l-4 border-red-500 rounded-tl" />
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-4 border-r-4 border-red-500 rounded-tr" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-4 border-l-4 border-red-500 rounded-bl" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-4 border-r-4 border-red-500 rounded-br" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
                    <Camera className="h-12 w-12 text-zinc-600 mb-3 animate-pulse" />
                    <p className="text-xs font-semibold text-zinc-300">Awaiting Camera Connection...</p>
                    <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">Please allow camera permissions or upload a file directly.</p>
                  </div>
                )}

                {/* Loading Scanner Indicator */}
                {isScanning && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-center z-20">
                    <Loader2 className="h-10 w-10 text-red-500 animate-spin mb-3" />
                    <p className="text-sm font-black text-white tracking-wider uppercase animate-pulse">Analyzing Image...</p>
                    <p className="text-xs text-zinc-400 mt-1">Gemini AI is recognizing products in your frame</p>
                  </div>
                )}
              </div>

              {/* Error Feedback */}
              {scanError && (
                <div className="bg-red-900/30 border-y border-red-900/50 px-4 py-2.5 text-[11px] text-red-300 leading-relaxed text-center">
                  {scanError}
                </div>
              )}

              {/* Footer Controls */}
              <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* File Upload Backup */}
                <div>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </button>
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    onChange={handleCameraFileChange}
                    className="hidden"
                  />
                </div>

                {/* Capture & Cancel */}
                <div className="flex items-center gap-2">
                  {cameraStream && (
                    <button
                      onClick={capturePhoto}
                      disabled={isScanning}
                      className="bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                      Capture Photo
                    </button>
                  )}
                  <button
                    onClick={() => setIsCameraOpen(false)}
                    className="border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Icons Bar - Flipkart Grocery Style */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 overflow-x-auto scrollbar-none" id="categories-shortcut-bar">
        <div className="flex justify-between items-center min-w-[760px] gap-4">
          
          {/* "All" Category Badge */}
          <button
            onClick={() => setSelectedCategory('All')}
            className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none flex-1"
            id="cat-shortcut-all"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              selectedCategory === 'All' 
                ? 'bg-emerald-800 text-white ring-4 ring-emerald-100 scale-105' 
                : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-800'
            }`}>
              <Sparkles className="h-6 w-6" />
            </div>
            <span className={`text-xs font-semibold tracking-tight transition-colors ${
              selectedCategory === 'All' ? 'text-emerald-800 font-bold' : 'text-gray-700'
            }`}>
              All Items
            </span>
          </button>

          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            
            // Render nice mini icons for categories
            const getCategoryIcon = (category: string) => {
              switch (category) {
                case 'Fruits & Vegetables': return '🍎';
                case 'Dairy & Eggs': return '🥛';
                case 'Pantry & Staples': return '🌾';
                case 'Bakery & Bread': return '🍞';
                case 'Beverages': return '🥤';
                case 'Snacks & Sweets': return '🍫';
                case 'Household Supplies': return '🧼';
                case 'Personal Care': return '🧴';
                case 'Electronics': return '🔌';
                default: return '🛍️';
              }
            };

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none flex-1"
                id={`cat-shortcut-${idx}`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                  isSelected 
                    ? 'bg-emerald-800 ring-4 ring-emerald-100 scale-105 text-white' 
                    : 'bg-gray-50 text-gray-700 hover:bg-emerald-50'
                }`}>
                  {getCategoryIcon(cat)}
                </div>
                <span className={`text-xs font-semibold text-center tracking-tight truncate w-24 transition-colors ${
                  isSelected ? 'text-emerald-800 font-bold' : 'text-gray-700'
                }`}>
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Offer Banner Slider */}
      {searchQuery === '' && (
        <div className="relative rounded-xl overflow-hidden shadow-sm mb-8 h-40 md:h-48" id="offer-banners">
          {offers.map((offer, idx) => (
            <div
              key={offer.id}
              className={`absolute inset-0 bg-gradient-to-r ${offer.bg} text-white p-6 md:p-8 flex flex-col justify-center transition-all duration-500 ease-in-out ${
                idx === activeOffer ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
              }`}
            >
              <div className="max-w-md">
                <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                  Local Store Deal
                </span>
                <h2 className="text-xl md:text-3xl font-extrabold tracking-tight mt-1 mb-2 leading-tight">
                  {offer.title}
                </h2>
                <p className="text-sm md:text-base text-white/90 font-medium">
                  {offer.desc}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs bg-yellow-400 text-gray-900 font-extrabold px-3 py-1 rounded-sm shadow-sm">
                    CODE: {offer.tag}
                  </span>
                  <span className="text-xs text-white/80 font-semibold flex items-center gap-0.5">
                    Tap to apply <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Indicator dots */}
          <div className="absolute bottom-3 right-6 flex gap-1.5 z-10">
            {offers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveOffer(idx)}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx === activeOffer ? 'bg-white w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 🏬 Premium Featured Physical Storefront Banner Card */}
      {searchQuery === '' && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl mb-8 flex flex-col md:flex-row items-stretch" id="physical-storefront-banner">
          {/* Left Side: Storefront photo with tag overlay */}
          <div className="relative w-full md:w-2/5 min-h-[220px] md:min-h-auto flex-shrink-0">
            <img 
              src={storefrontImg} 
              alt="Bari All-In-One Mart Physical Store" 
              className="w-full h-full object-cover object-center absolute inset-0 transition-transform duration-700 hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Elegant dark gradient overlay to blend into content */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-950/20 to-transparent" />
            <span className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded shadow-md uppercase animate-pulse">
              📍 Visit Physical Store
            </span>
          </div>

          {/* Right Side: Store Details & Trust Badges */}
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-center text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                Trusted Local Partner
              </span>
              <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                Now on 2nd Floor
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-2 leading-none flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <span>Bari' All-In-One Mart</span>
              <span className="text-xs font-normal text-slate-400 font-mono hidden sm:inline">|</span>
              <span className="text-sm font-bold text-yellow-400 font-mono sm:mt-1">+91 75002 36520</span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed max-w-xl mb-4 font-medium">
              We are delighted to welcome you to our fully stocked double-floor grocery store! Located locally, we offer the finest range of organic groceries, household goods, daily essentials, cosmetics, home supplies, and exciting toys under one roof. 
            </p>

            {/* Grid of Storefront Trust Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
              <div className="flex items-start gap-2 text-xs">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <h4 className="font-bold text-slate-200">Quality, Trust & Taste</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Pure, fresh, and handpicked products only.</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <h4 className="font-bold text-slate-200">2nd Floor Now Active</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Bigger inventory of home goods, essentials & toys.</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="text-red-400 font-bold">🚫</span>
                <div>
                  <h4 className="font-bold text-red-400">Strict Return Policy</h4>
                  <p className="text-[11px] text-slate-400 font-medium">बिक्री के बाद कोई सामान वापस नहीं होगा।</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="text-emerald-400 font-bold">📞</span>
                <div>
                  <h4 className="font-bold text-slate-200">Fast Local Pickups</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Order online, pick up or get delivered directly.</p>
                </div>
              </div>
            </div>

            {/* Support Phone, WhatsApp & Restaurant Button */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400">
                Opening Hours: <strong className="text-slate-200 font-medium">08:00 AM — 10:00 PM Daily</strong>
              </div>
              <div className="flex items-center gap-2">
                {onOpenRestaurant && (
                  <button 
                    onClick={onOpenRestaurant}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 rounded-lg shadow transition cursor-pointer"
                  >
                    🍽️ Order Food / Restaurant
                  </button>
                )}
                <a 
                  href="https://wa.me/917500236520" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white rounded-lg shadow transition cursor-pointer"
                >
                  💬 Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="catalog-toolbar">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-1.5" id="current-category-title">
            {selectedCategory === 'All' ? 'All Groceries & Staples' : selectedCategory}
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-mono">
              {processedProducts.length} {processedProducts.length === 1 ? 'item' : 'items'} found
            </span>
          </h2>
          {searchQuery && (
            <p className="text-xs text-gray-500 mt-0.5">
              Showing search results for &ldquo;<span className="font-semibold text-emerald-800">{searchQuery}</span>&rdquo;
            </p>
          )}
        </div>

        {/* Sort Actions */}
        <div className="flex items-center gap-2 text-sm text-gray-700" id="sorting-panel">
          <span className="text-gray-500 flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" /> Sort By:
          </span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'popular', label: 'Popular' },
              { id: 'priceAsc', label: 'Price: Low to High' },
              { id: 'priceDesc', label: 'Price: High to Low' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id as any)}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition ${
                  sortBy === option.id
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {processedProducts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm" id="empty-catalog-state">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Products Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            We couldn't find any groceries in this view. Try changing your search keywords or choosing another category!
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-950 rounded shadow"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6" id="products-grid">
          {processedProducts.map((product) => {
            const quantity = cart[product.id] || 0;
            const discount = getDiscountPercentage(product.price, product.originalPrice);
            const isLowStock = product.stock > 0 && product.stock <= 10;
            const isOutOfStock = product.stock <= 0;

            return (
              <motion.div 
                key={product.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                whileHover={{ y: -4, scale: 1.015 }}
                onClick={() => onProductClick?.(product)}
                className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col relative overflow-hidden cursor-pointer"
                id={`product-card-${product.id}`}
              >

                {/* Stock Tag */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-20 flex items-center justify-center">
                    <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded shadow">
                      Out of Stock
                    </span>
                  </div>
                )}

                {/* Image Section */}
                <div className="h-40 md:h-48 relative overflow-hidden bg-gray-50 p-2 border-b border-gray-100 flex items-center justify-center">
                  <ProductPlaceholderImage
                    image={product.image}
                    name={product.name}
                    category={product.category}
                    className="w-full h-full object-contain rounded-md group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Immediate Image Upload Overlay */}
                  {isAdmin && (
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRefs.current[product.id]?.click();
                        }}
                        className="bg-white/95 hover:bg-white text-gray-800 text-[11px] font-bold px-2.5 py-1.5 rounded shadow flex items-center gap-1 transition"
                        title="Upload fresh photo"
                      >
                        <Upload className="h-3.5 w-3.5 text-emerald-800" />
                        <span>Upload Photo</span>
                      </button>
                      <span className="text-[9px] text-white/90">Click to upload photo</span>
                      <input
                        type="file"
                        ref={(el) => { fileInputRefs.current[product.id] = el; }}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleCardImageUpload(product.id, e)}
                      />
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Size & Category Tag */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold tracking-tight text-emerald-850 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded">
                          {product.unit}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold truncate max-w-[100px]">
                        {product.category}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-xs md:text-sm font-bold text-gray-800 line-clamp-2 leading-tight min-h-[32px] md:min-h-[40px] group-hover:text-emerald-800 transition-colors">
                      {product.name}
                    </h3>

                    {/* Stock indicator */}
                    {isLowStock && (
                      <p className="text-[10px] font-semibold text-rose-500 mt-1">
                        Only {product.stock} items left!
                      </p>
                    )}
                  </div>

                  {/* Pricing and Cart Actions */}
                  <div className="mt-3 border-t border-gray-50 pt-3">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm md:text-base font-extrabold text-gray-900">
                        ₹{product.price}
                      </span>
                    </div>

                    {/* Flipkart-style quantity controls */}
                    <div className="mt-3">
                      {quantity === 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                          }}
                          disabled={isOutOfStock}
                          className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-xs md:text-sm py-1.5 px-3 rounded shadow-sm flex items-center justify-center gap-1 border border-emerald-800 hover:shadow-md transition active:scale-[0.98] disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:pointer-events-none"
                          id={`add-btn-${product.id}`}
                        >
                          <span>ADD TO CART</span>
                        </button>
                      ) : (
                        <div 
                          className="flex items-center w-full border border-emerald-600 rounded overflow-hidden"  
                          id={`qty-counter-${product.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromCart(product);
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1.5 text-xs md:text-sm flex-1 text-center select-none active:bg-emerald-200 transition"
                            id={`qty-minus-${product.id}`}
                          >
                            &minus;
                          </button>
                          <span className="text-xs md:text-sm font-extrabold text-emerald-800 bg-white px-2 py-1.5 flex-1 text-center select-none">
                            {quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product);
                            }}
                            disabled={quantity >= product.stock}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1.5 text-xs md:text-sm flex-1 text-center select-none active:bg-emerald-200 transition disabled:opacity-50 disabled:pointer-events-none"
                            id={`qty-plus-${product.id}`}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
