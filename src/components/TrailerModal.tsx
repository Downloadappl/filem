import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  youtubeKey: string | null;
  videoTitle?: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ 
  isOpen, 
  onClose, 
  youtubeKey, 
  videoTitle 
}) => {
  const { t } = useTranslation();

  // Block bodily scrolling when trailer modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Blackout blur backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
          />

          {/* Modal content container */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden glass-panel shadow-2xl border border-white/10 z-10 bg-[#0B0B0F]"
          >
            {/* Header toolbar */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-[#0B0B0F] to-transparent flex items-center justify-between px-4 z-20 pointer-events-none">
              <h3 className="font-bold text-sm tracking-tight text-white drop-shadow cinematic-shadow select-none line-clamp-1 max-w-[80%] pointer-events-auto">
                {videoTitle || t("appName")}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-brand-primary text-white flex items-center justify-center transition-colors border border-white/5 pointer-events-auto"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embed Loader */}
            {youtubeKey ? (
              <iframe
                id="trailer-youtube-iframe"
                src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&modestbranding=1&rel=0`}
                title={videoTitle || "Trailer video"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full pt-14"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400">
                <p className="font-semibold text-lg">{t("noTrailer")}</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default TrailerModal;
