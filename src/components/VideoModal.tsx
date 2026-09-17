import React, { useEffect } from 'react';
import { X, ExternalLink, Play, Sparkles } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  itemName: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  itemName,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !videoUrl) return null;

  const isInstagram = videoUrl.includes('instagram.com');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      id="video-preview-modal"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100 bg-stone-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Play className="w-4 h-4 fill-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base leading-tight">
                {itemName}
              </h3>
              <p className="text-xs text-stone-500">
                {isInstagram ? 'Instagram Reel Showcase' : 'Video Reel / Review'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 mx-auto mb-4 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Play className="w-9 h-9 text-rose-500 fill-rose-500 ml-1" />
            </div>
          </div>

          <h4 className="font-extrabold text-stone-900 text-lg mb-1">
            Watch Fresh Dish Preparation
          </h4>
          <p className="text-xs text-stone-600 mb-6 max-w-xs mx-auto leading-relaxed">
            See how our culinary chefs prepare <strong>{itemName}</strong> fresh to order with authentic ingredients.
          </p>

          <a
            id="btn-open-instagram-reel"
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <span>Open in Instagram / Video Player</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <p className="text-[11px] text-stone-400 mt-3 truncate px-2 font-mono">
            {videoUrl}
          </p>
        </div>
      </div>
    </div>
  );
};
export default VideoModal;
