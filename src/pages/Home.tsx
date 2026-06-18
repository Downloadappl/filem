import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { MovieCard } from "../components/MovieCard";
import { SkeletonList, HeroSkeleton } from "../components/SkeletonList";
import { TrailerModal } from "../components/TrailerModal";
import { MediaItem } from "../types";
import { Play, Sparkles, AlertTriangle, Star, RefreshCw, Calendar, Eye, Bookmark, Trophy, ChevronRight, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // State arrays
  const [heroMovie, setHeroMovie] = useState<MediaItem | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [trendingTv, setTrendingTv] = useState<MediaItem[]>([]);
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [upcoming, setUpcoming] = useState<MediaItem[]>([]);

  // Loading toggles
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingCarousels, setLoadingCarousels] = useState(true);

  // AI Assistant discovery states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResults, setAiResults] = useState<MediaItem[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Trailing Trailer popup trigger
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [heroTrailerKey, setHeroTrailerKey] = useState<string | null>(null);

  // Suggested preset prompts based on current language
  const promptPresets = i18n.language === "ar" ? [
    { label: "🪐 خيال علمي فضاء غامض", text: "فيلم خيال علمي غامض مليء بالتشويق في الفضاء الخارجي مع نهايات غير متوقعة" },
    { label: "🕵️‍♂️ دراما جريمة وحل ألغاز", text: "مسلسل حل قضايا وذكاء وتحقيق مليء بالغموض والإثارة على غرار قصة شيرلوك هولمز" },
    { label: "🍿 كوميديا عائلية دافئة", text: "فيلم كوميدي عائلي دافئ وممتع ولطيف للمشاهدة مع الأصدقاء والسهرات" },
    { label: "🧠 أكشن وإثارة تلاعب بالعقل", text: "فيلم إثارة وتلاعب نفساني مع تتابع أحداث سريع وذكي يجعلك تفكر طوال العرض" }
  ] : [
    { label: "🪐 Cosmic Space Mystery", text: "A slow-burn sci-fi mystery set in deep space with mind-bending cosmic themes" },
    { label: "🕵️‍♂️ Sherlock-style Detective Drama", text: "An intellectual, nail-biting detective thriller tv show focused on puzzle-solving" },
    { label: "🍿 Cozy Family Comedy", text: "A heartwarming, laugh-out-loud family comedy movie for a cozy evening" },
    { label: "🧠 Mind-twister Thriller", text: "A highly psychological plot-twist movie style of Christopher Nolan with high suspense" }
  ];

  // Fetch initial TMDB content
  useEffect(() => {
    const fetchHomeData = async () => {
      setLoadingCarousels(true);
      try {
        // Fetch trending movies, trending TV, top rated, and upcoming
        const lang = i18n.language;
        const [resMovies, resTv, resTop, resUpcoming] = await Promise.all([
          fetch(`/api/trending/movies?language=${lang}`).then(r => r.json()),
          fetch(`/api/trending/tv?language=${lang}`).then(r => r.json()),
          fetch(`/api/top-rated?type=movie&language=${lang}`).then(r => r.json()),
          fetch(`/api/upcoming?language=${lang}`).then(r => r.json())
        ]);

        const trendingMoviesList = resMovies.results || [];
        setTrendingMovies(trendingMoviesList);
        setTrendingTv(resTv.results || []);
        setTopRated((resTop.results || []).slice(0, 12));
        setUpcoming((resUpcoming.results || []).slice(0, 12));

        // Randomly pick a top trending movie with backdrop as hero promo
        if (trendingMoviesList.length > 0) {
          const validHeroes = trendingMoviesList.filter((m: any) => m.backdrop_path && m.overview);
          const choice = validHeroes.length > 0 
            ? validHeroes[Math.floor(Math.random() * Math.min(6, validHeroes.length))] 
            : trendingMoviesList[0];
          setHeroMovie(choice);

          // Get trailer for Hero
          try {
            const detailRes = await fetch(`/api/details/movie/${choice.id}?language=${lang}`);
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              const trailers = detailData.videos?.results || [];
              const officialTrailer = trailers.find((v: any) => v.type === "Trailer" && v.site === "YouTube") || trailers[0];
              if (officialTrailer) {
                setHeroTrailerKey(officialTrailer.key);
              }
            }
          } catch (e) {
            console.error("Failed to fetch official trailer for hero video:", e);
          }
        }
      } catch (err) {
        console.error("Failed to populate movie lists:", err);
      } finally {
        setLoadingHero(false);
        setLoadingCarousels(false);
      }
    };

    fetchHomeData();
  }, [i18n.language]);

  // Handle AI Discovery call
  const handleAiDiscover = async (e?: React.FormEvent, selectedPrompt?: string) => {
    if (e) e.preventDefault();
    const query = selectedPrompt || aiPrompt;
    if (!query.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setAiResults([]);
    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          language: i18n.language,
          count: 6
        })
      });

      if (!response.ok) {
        throw new Error("API failure");
      }

      const data = await response.json();
      setAiResults(data || []);
    } catch (err) {
      setAiError(
        i18n.language === "ar" 
          ? "فشل الذكاء الاصطناعي في الاتصال وقراءة البيانات. الرجاء المحاولة مجدداً." 
          : "AI failed to respond. Please review settings or retry again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger global Surprise Me button selector
  const handleGlobalSurpriseMe = () => {
    // Collect all loaded titles
    const pool = [...trendingMovies, ...trendingTv, ...topRated, ...upcoming];
    if (pool.length > 0) {
      const luckyDraw = pool[Math.floor(Math.random() * pool.length)];
      const type = luckyDraw.title ? "movie" : "tv";
      navigate(`/details/${type}/${luckyDraw.id}?surprise=true`);
    } else {
      // fallback
      navigate("/discover?surprise=true");
    }
  };

  return (
    <div className="w-full pb-16 space-y-12" id="home-view-port">
      
      {/* 🎬 MAIN HERO BACKDROP PROMO 🎬 */}
      {loadingHero ? (
        <HeroSkeleton />
      ) : heroMovie ? (
        <div className="relative w-full h-[70vh] min-h-[480px] flex items-end">
          {/* Cover Backdrop with blending glow gradients to dark palette background */}
          <div className="absolute inset-0 z-0">
            <img 
              src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`}
              alt={heroMovie.title || heroMovie.name}
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/45 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0F] via-[#0B0B0F]/20 to-transparent" />
          </div>

          {/* Hero text metadata content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-8 sm:pb-12 text-start w-full">
            <div className="max-w-2xl space-y-4">
              
              <div className="flex items-center gap-2 text-brand-primary font-bold text-xs uppercase tracking-widest bg-red-650/15 px-3 py-1 rounded-full w-fit backdrop-blur-md border border-brand-primary/10">
                <Sparkles className="w-3.5 h-3.5 fill-current animate-spin" />
                <span>{t("trendingMovies")}</span>
              </div>

              <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight cinematic-shadow text-white">
                {heroMovie.title || heroMovie.name}
              </h1>

              {/* Meta information tags */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-neutral-300 drop-shadow">
                <div className="flex items-center gap-1.5 text-brand-accent">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{heroMovie.vote_average.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{heroMovie.release_date ? new Date(heroMovie.release_date).getFullYear() : t("tvShow")}</span>
                <span>•</span>
                <span className="bg-white/10 px-2 py-0.5 rounded border border-white/5 uppercase">TMDB</span>
              </div>

              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed line-clamp-3 md:line-clamp-4 cinematic-shadow">
                {heroMovie.overview}
              </p>

              {/* Control panel */}
              <div className="flex flex-wrap gap-3.5 pt-4">
                <Link 
                  to={`/details/movie/${heroMovie.id}`}
                  className="bg-brand-primary hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t("discoverMore")}</span>
                </Link>

                {heroTrailerKey && (
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="bg-white/10 hover:bg-white/15 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-all backdrop-blur-md border border-white/10 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current text-white" />
                    <span>Watch Trailer</span>
                  </button>
                )}

                <button
                  onClick={handleGlobalSurpriseMe}
                  className="bg-neutral-900 hover:bg-neutral-800 text-brand-accent font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-all border border-brand-accent/20 active:scale-95 cursor-pointer"
                >
                  <span>{t("surpriseMe")}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Embedded trailer popup modal */}
          {heroTrailerKey && (
            <TrailerModal 
              isOpen={trailerOpen}
              onClose={() => setTrailerOpen(false)}
              youtubeKey={heroTrailerKey}
              videoTitle={heroMovie.title || heroMovie.name}
            />
          )}

        </div>
      ) : null}

      {/* 🤖 ROBOT RECONCILIATION: AI SMART DISCOVERY CONCIERGE PANEL 🤖 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl border border-white/5">
          {/* Subtle gradient light flare in top right */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-red-650/10 blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 text-start">
              <h2 className="font-extrabold text-xl sm:text-2xl text-white flex items-center gap-2">
                <Sparkles className="w-5.5 h-5.5 text-brand-accent animate-pulse" />
                <span>{t("aiRecommendation")}</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                {t("tagline")}. Describe your current feeling or request a bespoke pairing!
              </p>
            </div>
          </div>

          {/* AI prompt form box */}
          <form onSubmit={(e) => handleAiDiscover(e)} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder={t("aiInputPlaceholder")}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={aiLoading}
              className="flex-1 bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary placeholder-neutral-600 font-medium"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiPrompt.trim()}
              className="bg-brand-primary hover:bg-neutral-900 hover:text-brand-primary text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer border border-brand-primary/20"
            >
              {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-current" />}
              <span>{t("aiSubmit")}</span>
            </button>
          </form>

          {/* Preset mood prompts helper pills */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest text-start flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t("or")} {t("surpriseChoice")}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {promptPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAiPrompt(preset.text);
                    handleAiDiscover(undefined, preset.text);
                  }}
                  className="bg-white/5 hover:bg-neutral-800 border border-white/5 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-300 hover:text-brand-accent transition-all cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Loader response loading progression */}
          {aiLoading && (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 rounded-full border-2 border-brand-accent border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-brand-accent animate-pulse">
                {t("aiThinking")}
              </p>
              <p className="text-xs text-neutral-500">{t("aiLoadingProgress")}</p>
            </div>
          )}

          {/* AI Error */}
          {aiError && (
            <div className="p-4 bg-red-650/10 border border-red-650/20 text-red-400 rounded-xl flex items-center gap-3 text-sm text-start">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {/* AI Generated Film Suggestions Rows */}
          {aiResults.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-accent" />
                <h3 className="font-extrabold text-base text-brand-accent uppercase tracking-wide">
                  ✨ {i18n.language === "ar" ? "توصيات الذكاء الاصطناعي المقترحة" : "Personalized Choices For You"}
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {aiResults.map((item) => (
                  <MovieCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 🎞️ CAROUSELS & ROWS SECTIONS 🎞️ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ROW 1: TRENDING MOVIES ROW */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-brand-primary" />
              <span>{t("trendingMovies")}</span>
            </h3>
            <Link 
              to="/discover?type=movie&sort=popularity.desc" 
              className="text-neutral-400 hover:text-brand-primary text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <span>{t("discoverMore")}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingCarousels ? (
            <SkeletonList count={6} />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {trendingMovies.slice(0, 10).map((movie) => (
                <div key={movie.id} className="w-[170px] sm:w-[190px] flex-shrink-0">
                  <MovieCard item={movie} mediaTypeFallback="movie" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ROW 2: TRENDING TV SHOWS ROW */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-accent animate-pulse" />
              <span>{t("trendingTv")}</span>
            </h3>
            <Link 
              to="/discover?type=tv&sort=popularity.desc" 
              className="text-neutral-400 hover:text-brand-primary text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <span>{t("discoverMore")}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingCarousels ? (
            <SkeletonList count={6} />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {trendingTv.slice(0, 10).map((tv) => (
                <div key={tv.id} className="w-[170px] sm:w-[190px] flex-shrink-0">
                  <MovieCard item={tv} mediaTypeFallback="tv" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* DOUBLE COLUMN ADVANCED METADATA ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Rated Titles Column */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-extrabold text-lg text-white">🏆 {t("topRated")}</h3>
              <Link to="/discover?sort=vote_average.desc" className="text-xs text-neutral-400 hover:text-white font-bold">{t("discoverMore")}</Link>
            </div>
            {loadingCarousels ? (
              <SkeletonList count={4} gridCols="grid-cols-2" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {topRated.slice(0, 6).map((item) => (
                  <MovieCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Movies Release Column */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-extrabold text-lg text-white">🚀 {t("upcomingReleases")}</h3>
              <Link to="/discover?sort=release_date.desc" className="text-xs text-neutral-400 hover:text-white font-bold">{t("discoverMore")}</Link>
            </div>
            {loadingCarousels ? (
              <SkeletonList count={4} gridCols="grid-cols-2" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {upcoming.slice(0, 6).map((item) => (
                  <MovieCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

        </div>

      </div>

    </div>
  );
};
export default Home;
