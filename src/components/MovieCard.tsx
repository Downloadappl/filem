import React from "react";
import { Link } from "react-router-dom";
import { Star, Bookmark, Heart, Check, Play, Share2 } from "lucide-react";
import { MediaItem } from "../types";
import { useWatchContext } from "../context/WatchContext";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

interface MovieCardProps {
  item: MediaItem;
  mediaTypeFallback?: "movie" | "tv";
}

export const MovieCard: React.FC<MovieCardProps> = ({ item, mediaTypeFallback }) => {
  const { t, i18n } = useTranslation();
  const { 
    toggleWatchlist, 
    toggleFavorite, 
    toggleWatched, 
    inWatchlist, 
    inFavorites, 
    inWatched 
  } = useWatchContext();

  const id = item.id;
  const isMovie = item.title !== undefined || item.media_type === "movie" || mediaTypeFallback === "movie";
  const typeStr = isMovie ? "movie" : "tv";
  const title = item.title || item.name || t("allTypes");
  const originalTitle = item.original_title || item.original_name;
  const releaseDate = item.release_date || item.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : "";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "0.0";

  const posterUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
    : null;

  const isFav = inFavorites(id);
  const isWatch = inWatchlist(id);
  const isDone = inWatched(id);

  // Copy-share recommendation link helper
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const detailUrl = `${window.location.origin}/#/details/${typeStr}/${id}`;
    navigator.clipboard.writeText(detailUrl);
    alert(t("shareSuccess"));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="relative group rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 aspect-[2/3] w-full flex flex-col cursor-pointer"
      id={`movie-card-${id}`}
    >
      {/* Visual background image or fallback gradient label */}
      {posterUrl ? (
        <img 
          src={posterUrl} 
          alt={title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-neutral-900 to-neutral-800 flex flex-col justify-center items-center p-4 text-center">
          <Play className="w-10 h-10 text-brand-primary opacity-40 mb-3" />
          <p className="font-bold text-sm tracking-tight text-neutral-300">{title}</p>
          {originalTitle && originalTitle !== title && (
            <p className="text-xs text-neutral-500 mt-1">{originalTitle}</p>
          )}
        </div>
      )}

      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Top action quick overlay buttons */}
      <div className="absolute top-2 left-2 right-2 flex justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <div className="flex gap-1">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(item); }}
            className={`p-1.5 rounded-lg transition-all duration-200 backdrop-blur-md ${
              isFav ? "bg-red-600 text-white" : "bg-black/60 text-white/70 hover:text-white"
            }`}
            title={t(isFav ? "removeFromFavorites" : "addToFavorites")}
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
          
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWatchlist(item); }}
            className={`p-1.5 rounded-lg transition-all duration-200 backdrop-blur-md ${
              isWatch ? "bg-brand-primary text-white" : "bg-black/60 text-white/70 hover:text-white"
            }`}
            title={t(isWatch ? "removeFromWatchlist" : "addToWatchlist")}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>

        <div className="flex gap-1">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWatched(item); }}
            className={`p-1.5 rounded-lg transition-all duration-200 backdrop-blur-md ${
              isDone ? "bg-green-600 text-white" : "bg-black/60 text-white/70 hover:text-white"
            }`}
            title={t(isDone ? "unmarkAsWatched" : "markAsWatched")}
          >
            <Check className="w-4 h-4" />
          </button>

          <button 
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-black/60 text-white/70 hover:text-white transition-all backdrop-blur-md"
            title={t("shareRecommendation")}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Rating Tag */}
      <div className="absolute top-2 rtl:left-2 ltr:right-2 backdrop-blur-md bg-black/60 px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-white/5 text-brand-accent z-10 shadow-lg">
        <Star className="w-3.5 h-3.5 fill-current" />
        <span>{rating}</span>
      </div>

      {/* Title Details (always bottom, grows on hover) */}
      <Link 
        to={`/details/${typeStr}/${id}`}
        className="absolute inset-0 flex flex-col justify-end p-3.5 text-start z-5"
      >
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-brand-primary tracking-wider mb-1">
            <span>{t(typeStr)}</span>
            {releaseYear && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="text-white/60">{releaseYear}</span>
              </>
            )}
          </div>
          
          <h3 className="font-bold text-sm tracking-tight leading-tight line-clamp-1 text-white group-hover:text-brand-primary transition-colors text-start">
            {title}
          </h3>

          {originalTitle && originalTitle !== title && (
            <p className="text-[11px] text-neutral-400 mt-0.5 font-medium line-clamp-1 italic text-start">
              {originalTitle}
            </p>
          )}

          {/* AI Reason or Short Overview indicator shown on hover */}
          {item.ai_reason ? (
            <p className="text-[11px] leading-relaxed text-brand-accent/90 line-clamp-2 mt-1.5 pt-1.5 border-t border-white/10 text-start bg-black/30 p-1 rounded font-medium">
              ✨ {item.ai_reason}
            </p>
          ) : (
            <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1.5 text-start">
              {item.overview || "..."}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};
export default MovieCard;
