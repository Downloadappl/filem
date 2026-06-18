import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MovieCard } from "../components/MovieCard";
import { SkeletonList } from "../components/SkeletonList";
import { MediaItem, Genre } from "../types";
import { Filter, Star, Clock, Calendar, RefreshCw, X, Play, Sliders, ChevronDown } from "lucide-react";
import { motion } from "motion/react";

export const Discover: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected filters states
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [releaseYear, setReleaseYear] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [minRuntime, setMinRuntime] = useState("0");
  const [maxRuntime, setMaxRuntime] = useState("240");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [page, setPage] = useState(1);

  // Genres from API
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(false);

  // Search Results states
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Get active genres based on type
  const activeGenresList = mediaType === "movie" ? movieGenres : tvGenres;

  // Fetch genres once on load (and when language changes)
  useEffect(() => {
    const fetchGenres = async () => {
      setLoadingGenres(true);
      try {
        const response = await fetch(`/api/genres?language=${i18n.language}`);
        if (response.ok) {
          const data = await response.json();
          setMovieGenres(data.movie || []);
          setTvGenres(data.tv || []);
        }
      } catch (err) {
        console.error("Genre load failed:", err);
      } finally {
        setLoadingGenres(false);
      }
    };
    fetchGenres();
  }, [i18n.language]);

  // Synchronize filters when URL query changes, or trigger initial search
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    const genreParam = searchParams.get("genre");
    const typeParam = searchParams.get("type");
    const sortParam = searchParams.get("sort");

    if (typeParam === "movie" || typeParam === "tv") {
      setMediaType(typeParam);
    }
    if (genreParam) {
      const ids = genreParam.split(",").map(Number).filter(Boolean);
      setSelectedGenreIds(ids);
    }
    if (sortParam) {
      setSortBy(sortParam);
    }

    setPage(1); // Reset page on query parameter shift
  }, [searchParams]);

  // Fetch active list of items based on filters or searching
  useEffect(() => {
    const fetchFilteredResults = async () => {
      setLoadingResults(true);
      try {
        const searchQuery = searchParams.get("search");
        let fetchUrl = "";

        if (searchQuery) {
          // If searching, use search route
          fetchUrl = `/api/search?query=${encodeURIComponent(searchQuery)}&language=${i18n.language}&page=${page}`;
        } else {
          // Use advanced discover parameters
          const params = new URLSearchParams({
            language: i18n.language,
            type: mediaType,
            page: page.toString(),
            sort_by: sortBy,
            with_genres: selectedGenreIds.join(","),
            primary_release_year: releaseYear,
            vote_average_gte: minRating,
            with_runtime_gte: minRuntime,
            with_runtime_lte: maxRuntime,
          });
          fetchUrl = `/api/discover?${params.toString()}`;
        }

        const response = await fetch(fetchUrl);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setTotalPages(Math.min(data.total_pages || 1, 100)); // cap at 100 pages for TMDB limitations
        }
      } catch (err) {
        console.error("Discover load failed:", err);
      } finally {
        setLoadingResults(false);
      }
    };

    fetchFilteredResults();
  }, [mediaType, selectedGenreIds, releaseYear, minRating, minRuntime, maxRuntime, sortBy, page, searchParams, i18n.language]);

  // Togglegenre selected filters
  const handleGenreToggle = (id: number) => {
    if (selectedGenreIds.includes(id)) {
      setSelectedGenreIds(selectedGenreIds.filter((x) => x !== id));
    } else {
      setSelectedGenreIds([...selectedGenreIds, id]);
    }
    setPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedGenreIds([]);
    setReleaseYear("");
    setMinRating("0");
    setMinRuntime("0");
    setMaxRuntime("240");
    setSortBy("popularity.desc");
    setPage(1);
    setSearchParams({}); // Clear Search values from URL
  };

  // Discover page Surprise Me button
  const handleSurpriseMeDraw = () => {
    if (results.length > 0) {
      const lucky = results[Math.floor(Math.random() * results.length)];
      setSearchParams({ selected_surprise: lucky.id.toString() });
      window.location.hash = `#/details/${mediaType}/${lucky.id}?surprise=true`;
    } else {
      alert("No titles available in your current filters list.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-start space-y-8" id="discover-root-port">
      
      {/* HEADER TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h1 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-brand-primary" />
            <span>{searchParams.get("search") ? `${t("recentSearches")}: "${searchParams.get("search")}"` : t("discoverFilters")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {t("tagline")}. Customize your matching layout parameters.
          </p>
        </div>

        {/* Surprise Me and Clear Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSurpriseMeDraw}
            disabled={loadingResults || results.length === 0}
            className="bg-neutral-900 border border-brand-accent/30 hover:border-brand-accent text-brand-accent px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current animate-pulse text-brand-accent" />
            <span>{t("surpriseMe")}</span>
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            className="bg-neutral-950 hover:bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* LEFT COLUMN: FILTERS INTERACTIVE PANEL (hidden sidebar or collapsible) */}
        {!searchParams.get("search") && (
          <aside className="glass-panel rounded-2xl p-5 sm:p-6 space-y-6 lg:col-span-1 border border-white/5">
            
            {/* 1. MEDIA TYPE SELECTOR */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{t("genres")}</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-950 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => { setMediaType("movie"); setSelectedGenreIds([]); setPage(1); }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mediaType === "movie" 
                      ? "bg-brand-primary text-white shadow-lg" 
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {t("movie")}
                </button>
                <button
                  type="button"
                  onClick={() => { setMediaType("tv"); setSelectedGenreIds([]); setPage(1); }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mediaType === "tv" 
                      ? "bg-brand-primary text-white shadow-lg" 
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {t("tvShow")}
                </button>
              </div>
            </div>

            {/* 2. GENRES CHECKLIST MULTI-SELECTOR */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                <span>{t("genres")}</span>
                {selectedGenreIds.length > 0 && (
                  <button onClick={() => setSelectedGenreIds([])} className="text-[10px] text-brand-primary font-bold hover:underline">
                    Reset
                  </button>
                )}
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto pr-1 no-scrollbar pt-1">
                {activeGenresList.map((genre) => {
                  const active = selectedGenreIds.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreToggle(genre.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                        active 
                          ? "bg-brand-accent/15 border-brand-accent text-brand-accent shadow" 
                          : "bg-white/5 border-white/5 text-neutral-400 hover:text-white hover:border-white/10"
                      }`}
                    >
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. RELEASE YEAR TEXT INPUT */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>{t("releaseYear")}</span>
              </label>
              <input
                type="number"
                min="1900"
                max="2035"
                placeholder="e.g., 2026"
                value={releaseYear}
                onChange={(e) => { setReleaseYear(e.target.value); setPage(1); }}
                className="w-full bg-neutral-950 border border-white/5 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-brand-primary"
              />
            </div>

            {/* 4. RATING SLIDER */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-brand-accent fill-current" />
                  <span>{t("minRating")}</span>
                </span>
                <span className="text-brand-accent">{minRating} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={minRating}
                onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
                className="w-full accent-brand-accent bg-neutral-950 py-1"
              />
            </div>

            {/* 5. RUNTIME DURATIONS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{t("runtime")}</span>
                </span>
                <span className="text-neutral-300">{minRuntime} - {maxRuntime} {t("minutes")}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minRuntime}
                  onChange={(e) => { setMinRuntime(e.target.value); setPage(1); }}
                  className="w-1/2 bg-neutral-950 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-center"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxRuntime}
                  onChange={(e) => { setMaxRuntime(e.target.value); setPage(1); }}
                  className="w-1/2 bg-neutral-950 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-center"
                />
              </div>
            </div>

            {/* 6. SORT BY SELECTOR */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{t("sortBy")}</label>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="w-full bg-neutral-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-brand-primary"
              >
                <option value="popularity.desc">{t("popularityDesc")}</option>
                <option value="vote_average.desc">{t("voteDesc")}</option>
                <option value="primary_release_date.desc">{t("releaseDesc")}</option>
              </select>
            </div>

          </aside>
        )}

        {/* RIGHT COLUMN: MAIN RESULTS LIST GRID (occupies full width if search mode activated) */}
        <div className={`space-y-6 ${searchParams.get("search") ? "lg:col-span-4" : "lg:col-span-3"}`}>
          
          {loadingResults ? (
            <SkeletonList count={8} gridCols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4" />
          ) : results.length === 0 ? (
            <div className="glass-panel rounded-2xl p-16 text-center space-y-4">
              <Sliders className="w-12 h-12 text-neutral-600 mx-auto" />
              <div className="space-y-1">
                <p className="font-extrabold text-lg text-white">{t("noResults")}</p>
                <p className="text-xs text-neutral-500">Try modifying genres selection or expanding runtime ratings.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {results.map((item) => (
                  <MovieCard key={item.id} item={item} mediaTypeFallback={mediaType} />
                ))}
              </div>

              {/* PAGINATION FOOTER */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 border-t border-white/5 pt-6 select-none">
                  <button
                    disabled={page === 1}
                    onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-45 text-white/80 px-4 py-2 rounded-xl text-xs font-extrabold transition-all border border-white/5 cursor-pointer"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-neutral-400 font-bold">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-45 text-white/80 px-4 py-2 rounded-xl text-xs font-extrabold transition-all border border-white/5 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
export default Discover;
