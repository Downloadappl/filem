import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useWatchContext } from "../context/WatchContext";
import { MovieCard } from "../components/MovieCard";
import { Bookmark, Heart, Check, Compass, Eye, Share2, Clipboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type TabType = "watchlist" | "favorites" | "watched";

export const Saved: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { watchlist, favorites, watched } = useWatchContext();

  const [activeTab, setActiveTab] = useState<TabType>("watchlist");

  const getActiveList = () => {
    switch (activeTab) {
      case "watchlist":
        return watchlist;
      case "favorites":
        return favorites;
      case "watched":
        return watched;
      default:
        return [];
    }
  };

  const activeList = getActiveList();

  const handleShareList = () => {
    const ids = activeList.map((x) => `${x.title ? "movie" : "tv"}:${x.id}`).join(",");
    if (!ids) {
      alert("Add some titles to your list before sharing!");
      return;
    }
    const sharedUrl = `${window.location.origin}/#/discover?shared_list=${encodeURIComponent(ids)}`;
    navigator.clipboard.writeText(sharedUrl);
    alert(t("shareSuccess"));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-start space-y-8" id="saved-lists-view">
      
      {/* HEADER TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h1 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-brand-primary" />
            <span>{t("watchlist")} & {t("favorites")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {t("tagline")}. Access your archived listings and viewing analytics offline.
          </p>
        </div>

        {/* Share active list */}
        {activeList.length > 0 && (
          <button
            type="button"
            onClick={handleShareList}
            className="flex items-center gap-2 bg-neutral-900 border border-brand-accent/40 text-brand-accent hover:border-brand-accent px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share This List</span>
          </button>
        )}
      </div>

      {/* TABS CONTROLLER BAR */}
      <div className="flex border-b border-white/5 p-1 bg-neutral-950/80 rounded-2xl w-fit gap-1 items-center">
        
        <button
          onClick={() => setActiveTab("watchlist")}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "watchlist" 
              ? "bg-brand-primary text-white shadow-lg" 
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>{t("watchlist")} ({watchlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "favorites" 
              ? "bg-brand-primary text-white shadow-lg" 
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>{t("favorites")} ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("watched")}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "watched" 
              ? "bg-brand-primary text-white shadow-lg" 
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{t("watched")} ({watched.length})</span>
        </button>

      </div>

      {/* MAIN DATA LISTS GRID AND EMPTY STATE FLIP */}
      <AnimatePresence mode="wait">
        {activeList.length === 0 ? (
          <motion.div
            key="empty-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="glass-panel rounded-2xl p-16 text-center space-y-6 border border-white/5"
          >
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center mx-auto shadow-inner text-neutral-500">
              {activeTab === "watchlist" ? <Bookmark className="w-6 h-6" /> : activeTab === "favorites" ? <Heart className="w-6 h-6" /> : <Check className="w-6 h-6" />}
            </div>
            
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="font-extrabold text-lg text-white">Your {activeTab} list is empty!</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Add titles to your {activeTab} folder directly from standard movie cards, 
                hero sliders, or artificial intelligence concierge recommendations.
              </p>
            </div>

            <button
              onClick={() => navigate("/discover")}
              className="bg-brand-primary hover:bg-neutral-900 hover:text-brand-primary text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 border border-brand-primary/10 active:scale-95 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Discover Library</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="results-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6"
          >
            {activeList.map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default Saved;
