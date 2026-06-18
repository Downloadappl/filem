import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { languages } from "../i18n";
import { useWatchContext } from "../context/WatchContext";
import { Search, Globe, Film, Bookmark, Compass, X, Star, Clock, Trash2, ArrowRight } from "lucide-react";
import { SearchSuggestion } from "../types";
import { motion, AnimatePresence } from "motion/react";

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { searchHistory, addToSearchHistory, clearSearchHistory } = useWatchContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Monitor wind-scrolling to convert header background to solid cinematic black
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Collapse dropdowns on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch instant autocomplete search suggestions from local proxy backend
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/search?query=${encodeURIComponent(searchQuery)}&language=${i18n.language}`
        );
        if (response.ok) {
          const data = await response.json();
          // Filter results to only valid movies & TV shows
          const filtered = (data.results || [])
            .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
            .slice(0, 5); // display top 5 results
          setSuggestions(filtered);
        }
      } catch (err) {
        console.error("Autocomplete fetch failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 280); // 280ms debounce delay to conserve bandwidth

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, i18n.language]);

  // Handle submit search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    addToSearchHistory(searchQuery);
    setShowSearchDropdown(false);
    navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Trigger search from suggestions
  const handleSuggestionClick = (item: SearchSuggestion) => {
    addToSearchHistory(item.title || item.name || "");
    setSearchQuery("");
    setShowSearchDropdown(false);
    navigate(`/details/${item.media_type}/${item.id}`);
  };

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("language", code);
    setShowLangDropdown(false);
  };

  const activeLangLabel = languages.find((l) => l.code === i18n.language)?.label || "العربية";

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? "bg-[#0B0B0F]/90 backdrop-blur-md border-b border-white/5 py-3 shadow-xl" 
          : "bg-gradient-to-b from-black/80 via-black/30 to-transparent py-5"
      }`}
      id="main-app-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* BRAND LOGO */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group"
          onClick={() => { setSearchQuery(""); setSuggestions([]); }}
        >
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 fill-current" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-brand-primary transition-colors">
            {t("appName")}
          </span>
        </Link>

        {/* DESKTOP ROUTING NAVIGATION */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link 
            to="/" 
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              location.pathname === "/" 
                ? "bg-white/5 text-brand-primary border border-white/5" 
                : "text-white/70 hover:text-white"
            }`}
          >
            {t("discoverMore")}
          </Link>
          <Link 
            to="/discover" 
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              location.pathname === "/discover" 
                ? "bg-white/5 text-brand-primary border border-white/5" 
                : "text-white/70 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t("allGenres")}</span>
          </Link>
          <Link 
            to="/saved" 
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              location.pathname === "/saved" 
                ? "bg-white/5 text-brand-primary border border-white/5" 
                : "text-white/70 hover:text-white"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{t("watchlist")}</span>
          </Link>
        </nav>

        {/* INTERACTIVE AUTCOMPLETE SEARCH INPUT */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full bg-neutral-900/80 hover:bg-neutral-800/80 focus:bg-neutral-900 border border-white/10 rounded-xl py-2 px-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-primary/50 transition-all font-medium"
            />
            <div className="absolute top-1/2 -translate-y-1/2 rtl:left-3.5 ltr:right-3.5 flex items-center gap-1.5 text-neutral-500">
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery("")}
                  className="hover:text-white transition-colors p-0.5 rounded-full hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <Search className="w-4 h-4" />
            </div>
          </form>

          {/* SUGGESTIONS + HISTORY POPUP */}
          <AnimatePresence>
            {showSearchDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute top-full left-0 right-0 mt-3 rounded-xl overflow-hidden glass-panel border border-white/10 shadow-2xl z-50 text-neutral-200"
              >
                {/* Instant dynamic results */}
                {suggestions.length > 0 && (
                  <div className="p-2 border-b border-white/5 space-y-1">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      {t("popularContent")}
                    </div>
                    {suggestions.map((item) => {
                      const titleStr = item.title || item.name || "";
                      const typeStr = item.media_type === "movie" ? "movie" : "tvShow";
                      const yearStr = item.release_date || item.first_air_date 
                        ? new Date(item.release_date || item.first_air_date!).getFullYear() 
                        : "";
                      const poster = item.poster_path 
                        ? `https://image.tmdb.org/t/p/w92${item.poster_path}` 
                        : null;

                      return (
                        <div
                          key={`${item.media_type}-${item.id}`}
                          onClick={() => handleSuggestionClick(item)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer text-start"
                        >
                          {poster ? (
                            <img 
                              src={poster} 
                              alt={titleStr} 
                              className="w-10 aspect-[2/3] object-cover rounded bg-neutral-800"
                              referrerPolicy="referrer" 
                            />
                          ) : (
                            <div className="w-10 aspect-[2/3] bg-neutral-800 rounded flex items-center justify-center text-[9px] text-neutral-400 font-bold">
                              {t(item.media_type === "movie" ? "movie" : "tvShow")}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-sm truncate text-white">
                              {titleStr}
                            </h5>
                            <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                              <span>{t(typeStr)}</span>
                              {yearStr && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-neutral-700" />
                                  <span>{yearStr}</span>
                                </>
                              )}
                            </p>
                          </div>
                          {item.vote_average ? (
                            <div className="flex items-center gap-1 text-xs text-brand-accent font-bold bg-neutral-800/80 px-1.5 py-0.5 rounded">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{item.vote_average.toFixed(1)}</span>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Search History & Recent logs panel */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{t("recentSearches")}</span>
                    </span>
                    {searchHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={clearSearchHistory}
                        className="text-[10px] text-neutral-500 hover:text-brand-primary flex items-center gap-1 font-semibold transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{t("clearHistory")}</span>
                      </button>
                    )}
                  </div>

                  {searchHistory.length === 0 ? (
                    <div className="text-xs text-neutral-600 py-3 text-center">
                      {t("noResults")}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {searchHistory.map((hist, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setSearchQuery(hist);
                            navigate(`/discover?search=${encodeURIComponent(hist)}`);
                            setShowSearchDropdown(false);
                          }}
                          className="text-xs bg-white/5 hover:bg-neutral-800 hover:text-brand-primary px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors max-w-full truncate border border-white/5 text-neutral-300"
                        >
                          <span className="truncate">{hist}</span>
                          <ArrowRight className="w-3 h-3 text-neutral-600 rotate-45" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* LANGUAGE SELECTOR PANEL */}
        <div className="flex items-center gap-2">
          
          <div ref={langRef} className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-2 bg-neutral-900 border border-white/10 px-3 py-2 rounded-xl text-xs font-semibold text-white/90 hover:text-white transition-all shadow-md cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
              <span>{activeLangLabel}</span>
            </button>

            <AnimatePresence>
              {showLangDropdown && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full rtl:left-0 ltr:right-0 mt-2 w-36 rounded-xl overflow-hidden glass-panel border border-white/10 shadow-2xl z-50 py-1"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={`w-full text-start px-3.5 py-2 text-xs font-bold transition-colors ${
                        i18n.language === lang.code 
                          ? "bg-brand-primary text-white" 
                          : "text-neutral-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MOBILE NAVIGATION hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-xl bg-neutral-900 border border-white/10 text-white/80 hover:text-white"
          >
            <Compass className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* MOBILE COLLAPSIBLE ROUTING SIDEBAR */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 bg-[#0B0B0F]/95 backdrop-blur-xl mt-3 overflow-hidden text-start py-3"
          >
            <div className="px-4 space-y-2">
              {/* Mobile instant search box */}
              <form onSubmit={handleSearchSubmit} className="relative mb-3">
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2 px-4 text-xs text-white"
                />
                <button type="submit" className="absolute top-1/2 -move-y-1/2 rtl:left-3.5 ltr:right-3.5 text-neutral-400">
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="grid grid-cols-3 gap-2">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center px-4 py-3 rounded-xl bg-neutral-900 text-xs font-bold text-neutral-300 hover:text-brand-primary"
                >
                  <Film className="w-4 h-4 mb-1" />
                  <span>{t("allTypes")}</span>
                </Link>
                <Link
                  to="/discover"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center px-4 py-3 rounded-xl bg-neutral-900 text-xs font-bold text-neutral-300 hover:text-brand-primary"
                >
                  <Compass className="w-4 h-4 mb-1" />
                  <span>{t("genres")}</span>
                </Link>
                <Link
                  to="/saved"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center px-4 py-3 rounded-xl bg-neutral-900 text-xs font-bold text-neutral-300 hover:text-brand-primary"
                >
                  <Bookmark className="w-4 h-4 mb-1" />
                  <span>{t("watchlist")}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Header;
