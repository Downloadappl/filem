import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWatchContext } from "../context/WatchContext";
import { MovieCard } from "../components/MovieCard";
import { SkeletonList, DetailsSkeleton } from "../components/SkeletonList";
import { TrailerModal } from "../components/TrailerModal";
import { MediaItem, CastMember, VideoItem, Season, Episode } from "../types";
import { Star, Heart, Bookmark, Check, Play, Clock, Calendar, Users, List, Sparkles, Film, ArrowRight, Share2, ChevronDown, Award, Volume2, VolumeX, Maximize, Settings, RotateCcw, Info, ShieldAlert, Monitor, Pause } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Details: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();

  const { 
    toggleWatchlist, 
    toggleFavorite, 
    toggleWatched, 
    inWatchlist, 
    inFavorites, 
    inWatched 
  } = useWatchContext();

  // Primary data states
  const [details, setDetails] = useState<MediaItem | null>(null);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [crew, setCrew] = useState<CastMember[]>([]);
  const [trailers, setTrailers] = useState<VideoItem[]>([]);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [similar, setSimilar] = useState<MediaItem[]>([]);

  // TV show season episodes states
  const [selectedSeasonNum, setSelectedSeasonNum] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Layout states
  const [loading, setLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);

  // Streaming Video Player States
  const [activePlayer, setActivePlayer] = useState(false);
  const [playerSeasonNum, setPlayerSeasonNum] = useState<number | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<Episode | null>(null);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeServer, setActiveServer] = useState<string>("vidsrc_to");

  // Custom Mock Player Overlays & Settings
  const [overlayControlsEnabled, setOverlayControlsEnabled] = useState(true);
  const [mockIsPlaying, setMockIsPlaying] = useState(true);
  const [mockIsMuted, setMockIsMuted] = useState(false);
  const [mockVolume, setMockVolume] = useState(85);
  const [mockProgress, setMockProgress] = useState(12); // Initial timeline progress
  const [mockQuality, setMockQuality] = useState("1080p");

  // Get active player stream URL
  const getStreamUrl = () => {
    const tmdbId = details?.id || id;
    const season = playerSeasonNum || 1;
    const episode = playingEpisode?.episode_number || 1;

    return isMovie
      ? `https://vidsrc-embed.ru/embed/movie?tmdb=${tmdbId}`
      : `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
  };

  // Simulated progress timer for custom mock player experience
  useEffect(() => {
    if (!activePlayer || !mockIsPlaying) return;
    const interval = setInterval(() => {
      setMockProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.15;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [activePlayer, mockIsPlaying]);

  const mediaId = Number(id);
  const isMovie = type === "movie";

  // Share link helper
  const handleShareDetails = () => {
    const detailUrl = window.location.href;
    navigator.clipboard.writeText(detailUrl);
    alert(t("shareSuccess"));
  };

  // Fetch consolidated details payload on mediaId or language switch
  useEffect(() => {
    if (!id || !type) return;

    const fetchDetailsPayload = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/details/${type}/${id}?language=${i18n.language}`);
        if (response.ok) {
          const payload = await response.json();
          setDetails(payload.details);
          setImdbId(payload.externalIds?.imdb_id || payload.details?.imdb_id || null);
          setCast((payload.credits?.cast || []).slice(0, 10)); // Top 10 cast
          
          // Filter key crew roles (Director, Producer, Screenplay)
          const keyCrew = (payload.credits?.crew || []).filter((c: any) => 
            c.job === "Director" || c.job === "Producer" || c.job === "Screenplay" || c.job === "Writer"
          ).slice(0, 4);
          setCrew(keyCrew);
          
          const videoResults = payload.videos?.results || [];
          setTrailers(videoResults);
          
          // Find standard Youtube trailer key
          const officialTrailer = videoResults.find((v: any) => v.type === "Trailer" && v.site === "YouTube") || videoResults[0];
          if (officialTrailer) {
            setActiveTrailerKey(officialTrailer.key);
          } else {
            setActiveTrailerKey(null);
          }

          setRecommendations(payload.recommendations || []);
          setSimilar(payload.similar || []);

          // Preset automatic first season selection if television show
          if (type === "tv" && payload.details?.seasons?.length > 0) {
            const firstSeasonNum = payload.details.seasons[0].season_number;
            setSelectedSeasonNum(firstSeasonNum);
          } else {
            setSelectedSeasonNum(null);
            setEpisodes([]);
          }
        }
      } catch (err) {
        console.error("Conso detail load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailsPayload();
  }, [id, type, i18n.language]);

  // Dynamic episodes loader for TV seasons when selected season number updates
  useEffect(() => {
    if (isMovie || !selectedSeasonNum || !id) return;

    const fetchSeasonEpisodes = async () => {
      setLoadingEpisodes(true);
      try {
        let response = await fetch(`/api/tv/${id}/season/${selectedSeasonNum}?language=${i18n.language}`);
        let data: any = null;
        if (response.ok) {
          data = await response.json();
        } else if (i18n.language !== "en") {
          // Fail-safe second attempt using English locale
          const fallbackRes = await fetch(`/api/tv/${id}/season/${selectedSeasonNum}?language=en`);
          if (fallbackRes.ok) {
            data = await fallbackRes.json();
          }
        }
        if (data) {
          setEpisodes(data.episodes || []);
        }
      } catch (err) {
        console.error("Season episodes fetch failed:", err);
      } finally {
        setLoadingEpisodes(false);
      }
    };

    fetchSeasonEpisodes();
  }, [selectedSeasonNum, id, isMovie, i18n.language]);

  // Escape key handler for Theater Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsTheaterMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // TV autoplay logic: when they turn on active player for series but have no active epis, choose first
  useEffect(() => {
    if (!isMovie && activePlayer && !playingEpisode && episodes.length > 0) {
      setPlayingEpisode(episodes[0]);
      setPlayerSeasonNum(selectedSeasonNum);
    }
  }, [episodes, activePlayer, playingEpisode, isMovie, selectedSeasonNum]);

  // Next & previous episode benders
  const handleNextEpisode = () => {
    if (!episodes || !playingEpisode) return;
    const currentIndex = episodes.findIndex(ep => ep.episode_number === playingEpisode.episode_number);
    if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
      setPlayingEpisode(episodes[currentIndex + 1]);
    }
  };

  const handlePrevEpisode = () => {
    if (!episodes || !playingEpisode) return;
    const currentIndex = episodes.findIndex(ep => ep.episode_number === playingEpisode.episode_number);
    if (currentIndex !== -1 && currentIndex > 0) {
      setPlayingEpisode(episodes[currentIndex - 1]);
    }
  };

  // Play button click scrolling
  const handlePlayClick = () => {
    setActivePlayer(true);
    if (!isMovie) {
      if (!playingEpisode && episodes.length > 0) {
        setPlayingEpisode(episodes[0]);
        setPlayerSeasonNum(selectedSeasonNum || (details?.seasons && details.seasons.length > 0 ? details.seasons[0].season_number : 1));
      } else if (!playingEpisode) {
        const fallbackSeasonNum = selectedSeasonNum || (details?.seasons && details.seasons.length > 0 ? details.seasons[0].season_number : 1);
        setPlayerSeasonNum(fallbackSeasonNum);
      }
    }
    setTimeout(() => {
      document.getElementById("cinematic-player-section")?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Click episode handler
  const handleEpisodeClick = (ep: Episode) => {
    setPlayingEpisode(ep);
    setPlayerSeasonNum(selectedSeasonNum);
    setActivePlayer(true);
    setTimeout(() => {
      document.getElementById("cinematic-player-section")?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (!details) {
    return (
      <div className="max-w-4xl mx-auto py-32 px-4 text-center space-y-4">
        <Award className="w-12 h-12 text-brand-primary mx-auto animate-bounce" />
        <h2 className="font-extrabold text-xl text-neutral-300">Content Unrecoverable</h2>
        <p className="text-xs text-neutral-500">The content you are trying to read may be missing in TMDB servers.</p>
      </div>
    );
  }

  // List indicators checking
  const isFav = inFavorites(mediaId);
  const isWatch = inWatchlist(mediaId);
  const isDone = inWatched(mediaId);

  const backdropUrl = details.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` 
    : null;

  const posterUrl = details.poster_path 
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}` 
    : null;

  const title = details.title || details.name || "";
  const originalTitle = details.original_title || details.original_name;
  const ratingScore = details.vote_average ? details.vote_average.toFixed(1) : "0.0";
  const voteCount = details.vote_count || 0;
  const releaseDate = details.release_date || details.first_air_date;
  const runtime = details.runtime || (details.episode_run_time && details.episode_run_time[0]);

  return (
    <div className="w-full pb-24 space-y-12 text-start relative" id={`details-page-${mediaId}`}>
      
      {/* Dynamic Theater Mode dim overlay backdrop */}
      {isTheaterMode && activePlayer && (
        <div 
          onClick={() => setIsTheaterMode(false)}
          className="fixed inset-0 bg-black/95 z-40 transition-opacity duration-300 cursor-zoom-out"
        />
      )}

      {/* 1. CINEMATIC BACKDROP WALLPAPER */}
      <div className="relative w-full h-[60vh] md:h-[65vh] min-h-[380px] flex items-end">
        <div className="absolute inset-0 z-0">
          {backdropUrl ? (
            <img 
              src={backdropUrl} 
              alt={title}
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-neutral-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0F] via-transparent to-transparent" />
        </div>

        {/* Surprise choice confetti banner indicator */}
        {searchParams.get("surprise") === "true" && (
          <div className="absolute top-20 left-4 right-4 z-20 max-w-xl mx-auto glass-panel rounded-xl p-3 flex items-center gap-3 border-brand-accent/30 text-start bg-brand-accent/10">
            <Sparkles className="w-5 h-5 text-brand-accent animate-spin" />
            <div>
              <p className="font-bold text-xs text-brand-accent">🎲 Surprise Lucky Draw Pick!</p>
              <p className="text-[11px] text-neutral-300 mt-0.5">{t("surpriseChoice")}</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. DYNAMIC CONTENT SPLIT GRID */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 sm:-mt-52 relative ${isTheaterMode && activePlayer ? "z-50" : "z-10"} space-y-12`}>
        
        {/* CINEMATIC VIDEO STREAM PLAYER PORTAL */}
        <AnimatePresence>
          {activePlayer && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              id="cinematic-player-section"
              className="w-full relative z-30 mb-8 overflow-hidden rounded-2xl bg-neutral-950 border border-white/10 shadow-[0_20px_50px_rgba(229,9,20,0.15)]"
            >
              <div className="p-4 sm:p-6 space-y-4">
                {/* Header of player */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
                    <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-1.5">
                      <span>{t("appName") === "ماذا يجب أن أشاهد؟" ? "المشغّل السينمائي المباشر" : "Cinematic Player"}</span>
                      <span className="text-neutral-500 font-medium">|</span>
                      <span className="text-brand-accent truncate max-w-[155px] sm:max-w-xs">{title}</span>
                      {!isMovie && playingEpisode && (
                        <span className="text-neutral-300 font-bold ml-1.5 text-xs sm:text-sm bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {t("playingSeasonEp", { season: playerSeasonNum, episode: playingEpisode.episode_number })} {playingEpisode.name}
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Actions & toggles */}
                  <div className="flex items-center flex-wrap gap-2.5">
                    {/* Theater Mode Button */}
                    <button
                      type="button"
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        isTheaterMode 
                          ? "bg-amber-500/15 border border-amber-500 text-amber-500" 
                          : "bg-neutral-900 border border-white/5 text-neutral-400 hover:border-white/10 hover:text-white"
                      }`}
                      title={t("theaterModeDesc")}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t("theaterMode")}</span>
                    </button>

                    {/* Close player button */}
                    <button
                      type="button"
                      onClick={() => {
                        setActivePlayer(false);
                        setIsTheaterMode(false);
                      }}
                      className="bg-neutral-900 border border-white/5 hover:border-brand-primary/30 hover:bg-brand-primary/10 text-neutral-300 hover:text-brand-primary transition-all px-3 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer"
                    >
                      {t("closePlayer")}
                    </button>
                  </div>
                </div>

                {/* Main Player Area */}
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
                  {/* Service stream iframe player */}
                  <iframe
                    src={getStreamUrl()}
                    className="w-full h-full border-0"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                    allow="autoplay; encrypted-media; picture-in-picture; web-share"
                  />
                </div>

                {/* Next / Prev Episode Navigator for TV Shows */}
                {!isMovie && episodes.length > 1 && playingEpisode && (
                  <div className="flex items-center justify-between gap-4 bg-neutral-900/40 p-3 rounded-xl border border-white/5">
                    <button
                      type="button"
                      disabled={episodes.findIndex(ep => ep.episode_number === playingEpisode.episode_number) === 0}
                      onClick={handlePrevEpisode}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-neutral-300 hover:text-white bg-neutral-950 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                      <span>{t("prevEpisode")}</span>
                    </button>

                    <div className="text-[11px] font-semibold text-neutral-500 hidden sm:block">
                      <span>{playingEpisode.episode_number} / {episodes.length} {t("episodes")}</span>
                    </div>

                    <button
                      type="button"
                      disabled={episodes.findIndex(ep => ep.episode_number === playingEpisode.episode_number) === episodes.length - 1}
                      onClick={handleNextEpisode}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-neutral-300 hover:text-white bg-neutral-950 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <span>{t("nextEpisode")}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Post cover thumbnail */}
          <div className="col-span-1">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 border border-white/5 aspect-[2/3] w-full relative"
            >
              {posterUrl ? (
                <img 
                  src={posterUrl} 
                  alt={title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold bg-neutral-950">
                  {t("noTrailer")}
                </div>
              )}
            </motion.div>
          </div>

          {/* Text descriptions and list tools controls */}
          <div className="col-span-1 md:col-span-3 space-y-6 pt-16 md:pt-40">
            <div className="space-y-2">
              <h1 className="font-black text-3xl sm:text-4xl md:text-5xl leading-tight text-white tracking-tight cinematic-shadow">
                {title}
              </h1>
              {originalTitle && originalTitle !== title && (
                <p className="text-sm text-neutral-400 font-medium italic">
                  {originalTitle}
                </p>
              )}
            </div>

            {/* Tags array row */}
            <div className="flex flex-wrap items-center gap-2.5">
              {details.genres?.map((g) => (
                <span 
                  key={g.id} 
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/5"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Star scoring ratings metadata */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-300 border-y border-white/5 py-4">
              <div className="flex items-center gap-2 text-brand-accent">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-extrabold text-lg text-white">{ratingScore}</span>
                <span className="text-xs text-neutral-500">({voteCount} votes)</span>
              </div>

              {releaseDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <span>{new Date(releaseDate).toLocaleDateString(i18n.language, { year: "numeric", month: "long" })}</span>
                </div>
              )}

              {runtime ? (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span>{runtime} {t("minutes")}</span>
                </div>
              ) : null}

              {!isMovie && (
                <div className="flex items-center gap-4 text-xs font-bold bg-neutral-900 border border-white/5 px-3 py-1 rounded-lg">
                  <span className="text-neutral-400">{details.number_of_seasons} {t("seasons")}</span>
                  <span className="text-neutral-600">/</span>
                  <span className="text-brand-accent">{details.number_of_episodes} {t("episodes")}</span>
                </div>
              )}
            </div>

            {/* Overview paragraph */}
            <div className="space-y-2.5">
              <h2 className="font-bold text-sm text-neutral-400 uppercase tracking-widest">Overview</h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                {details.overview || "No overview logging translated in active language catalog."}
              </p>
            </div>

            {/* Interactive Control lists overlay panels */}
            <div className="flex flex-wrap gap-3 pt-2">
              
              <button
                onClick={() => toggleFavorite(details)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold transition-all active:scale-95 cursor-pointer border ${
                  isFav 
                    ? "bg-red-650/15 border-red-650 text-red-500" 
                    : "bg-neutral-900 border-white/5 hover:border-white/10 text-neutral-300"
                }`}
              >
                <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                <span>{t(isFav ? "removeFromFavorites" : "addToFavorites")}</span>
              </button>

              <button
                onClick={() => toggleWatchlist(details)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold transition-all active:scale-95 cursor-pointer border ${
                  isWatch 
                    ? "bg-brand-primary/10 border-brand-primary text-brand-primary" 
                    : "bg-neutral-900 border-white/5 hover:border-white/10 text-neutral-300"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isWatch ? "fill-current" : ""}`} />
                <span>{t(isWatch ? "removeFromWatchlist" : "addToWatchlist")}</span>
              </button>

              <button
                onClick={() => toggleWatched(details)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold transition-all active:scale-95 cursor-pointer border ${
                  isDone
                    ? "bg-green-600/10 border-green-600 text-green-500"
                    : "bg-neutral-900 border-white/5 hover:border-white/10 text-neutral-300"
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{t(isDone ? "unmarkAsWatched" : "markAsWatched")}</span>
              </button>

              <button
                onClick={handleShareDetails}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold bg-neutral-900 border border-white/5 hover:border-white/10 text-neutral-300 transition-all active:scale-95 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{t("shareRecommendation")}</span>
              </button>

              <button
                type="button"
                onClick={handlePlayClick}
                className="bg-brand-primary hover:bg-[#b80710] text-white font-black text-xs px-6 py-3 rounded-xl flex items-center gap-2.5 transition-all shadow-lg hover:shadow-brand-primary/20 scale-105 active:scale-95 cursor-pointer border border-brand-primary"
              >
                <Play className="w-4 h-4 fill-current text-white animate-pulse" />
                <span>{t("watchNow")}</span>
              </button>

              {activeTrailerKey && (
                <button
                  type="button"
                  onClick={() => setTrailerOpen(true)}
                  className="bg-neutral-900 border border-white/5 hover:border-white/10 hover:bg-neutral-950 text-neutral-300 hover:text-white font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Official Trailer</span>
                </button>
              )}

            </div>

            {/* Crew list details mapping */}
            {crew.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5 bg-neutral-900/10 p-4 rounded-xl">
                {crew.map((cr) => (
                  <div key={`${cr.id}-${cr.job}`} className="space-y-1">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{cr.job}</p>
                    <p className="text-sm font-semibold text-white">{cr.name}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* 3. CAST ROW PREVIEW ROW */}
        {cast.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-primary" />
              <span>{t("credits")}</span>
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {cast.map((actor) => {
                const picUrl = actor.profile_path 
                  ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` 
                  : null;

                return (
                  <div key={actor.id} className="w-[110px] text-center flex-shrink-0 space-y-2">
                    <div className="w-[90px] h-[90px] rounded-full overflow-hidden border-2 border-white/5 bg-neutral-900 mx-auto shadow-md">
                      {picUrl ? (
                        <img 
                          src={picUrl} 
                          alt={actor.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-neutral-600 bg-neutral-950 text-xs">
                          {actor.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-white truncate">{actor.name}</p>
                      <p className="text-[10px] text-neutral-500 truncate">{actor.character || "Role"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. TELEVISION SEASONS ACCORDION CONTEXT */}
        {!isMovie && details.seasons && details.seasons.length > 0 && (
          <section className="bg-neutral-900/10 rounded-2xl p-5 sm:p-6 border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <List className="w-5 h-5 text-brand-accent" />
                  <span>{t("seasons")} & {t("episodes")}</span>
                </h3>
                <p className="text-xs text-neutral-500">Pick a season to explore release logs and descriptions.</p>
              </div>

              {/* Season switcher drop-down input selector */}
              <div className="relative">
                <select
                  value={selectedSeasonNum || ""}
                  onChange={(e) => setSelectedSeasonNum(Number(e.target.value))}
                  className="bg-neutral-950 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none"
                >
                  {details.seasons.map((s) => (
                    <option key={s.season_number} value={s.season_number}>
                      {s.name} ({s.episode_count} {t("episodes")})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading episodes state */}
            {loadingEpisodes ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                <p className="text-xs text-neutral-400">Loading episodes from TMDB servers...</p>
              </div>
            ) : episodes.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">No episodes found inside this season folder.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {episodes.map((ep) => {
                  const stillUrl = ep.still_path 
                    ? `https://image.tmdb.org/t/p/w300${ep.still_path}` 
                    : null;
                  const isCurrent = activePlayer && playingEpisode?.id === ep.id;

                  return (
                    <button 
                      key={ep.id}
                      type="button"
                      onClick={() => handleEpisodeClick(ep)}
                      className={`flex gap-4 p-3.5 rounded-xl border text-start transition-all duration-200 cursor-pointer w-full items-start group/ep ${
                        isCurrent 
                          ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/30" 
                          : "border-white/5 bg-neutral-950/80 hover:border-white/15 hover:bg-neutral-900/60"
                      }`}
                    >
                      {/* Episode thumbnail preview */}
                      <div className="w-28 sm:w-32 aspect-video bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {stillUrl ? (
                          <img 
                            src={stillUrl} 
                            alt={ep.name} 
                            className="w-full h-full object-cover transition-transform group-hover/ep:scale-105"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-[10px] text-neutral-500 font-bold">
                            EP {ep.episode_number}
                          </div>
                        )}
                        
                        {/* Hover Overlay Play Icon */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/ep:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="w-5 h-5 text-brand-primary fill-current scale-90 group-hover/ep:scale-100 transition-transform" />
                        </div>

                        {/* Indication marker for currently playing */}
                        {isCurrent && (
                          <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-ping" />
                            <Play className="w-6 h-6 text-white absolute fill-current animate-pulse" />
                          </div>
                        )}

                        <div className="absolute bottom-1 right-1 bg-black/60 text-[9px] font-bold text-brand-accent px-1 rounded flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>{ep.vote_average ? ep.vote_average.toFixed(1) : "0.0"}</span>
                        </div>
                      </div>

                      {/* Episode summary and dates */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className={`font-bold text-xs sm:text-sm line-clamp-1 transition-colors ${
                          isCurrent ? "text-brand-primary" : "text-white group-hover/ep:text-brand-primary"
                        }`}>
                          {ep.episode_number}. {ep.name}
                        </h4>
                        
                        {ep.air_date && (
                          <p className="text-[10px] text-brand-primary font-bold">
                            {new Date(ep.air_date).toLocaleDateString(i18n.language, { year: "numeric", month: "short", day: "numeric" })}
                          </p>
                        )}

                        <p className="text-[11px] leading-relaxed text-neutral-400 line-clamp-2 sm:line-clamp-3">
                          {ep.overview || "No review summary saved."}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* 5. RECOMMENDATIONS CAROUSEL ROW */}
        {recommendations.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <Sparkles className="w-5 h-5 text-brand-accent animate-pulse" />
              <span>{t("recommendations")}</span>
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {recommendations.slice(0, 10).map((rec) => (
                <div key={rec.id} className="w-[170px] sm:w-[190px] flex-shrink-0">
                  <MovieCard item={rec} mediaTypeFallback={type as "movie" | "tv"} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. SIMILAR TITLES CAROUSEL ROW */}
        {similar.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <Film className="w-5 h-5 text-brand-primary" />
              <span>{t("similarContent")}</span>
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {similar.slice(0, 10).map((sim) => (
                <div key={sim.id} className="w-[170px] sm:w-[190px] flex-shrink-0">
                  <MovieCard item={sim} mediaTypeFallback={type as "movie" | "tv"} />
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Embedded dynamic trailer modal */}
      {activeTrailerKey && (
        <TrailerModal 
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          youtubeKey={activeTrailerKey}
          videoTitle={title}
        />
      )}

    </div>
  );
};
export default Details;
