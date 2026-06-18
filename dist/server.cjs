var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_config = require("dotenv/config");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  const TMDB_READ_ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjM2VhNDNlN2ZkMzczNDFiNWIyNjgwOTZiZWY3ZDY2MyIsIm5iZiI6MTc3MDU2NDMyNi4xMzkwMDAyLCJzdWIiOiI2OTg4YWFlNjg1N2JmYWEwMjE1Y2FhMzAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Z0llbzQvZtmkc6AlY0Zq7y2k-BCBH_0BbpYAmtRJi4c";
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";
  let ai = null;
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      console.log("Gemini AI Client initialized successfully.");
    } else {
      console.warn("No GEMINI_API_KEY environment variable. AI Discovery Assistant will fallback to smart TMDB ranking.");
    }
  } catch (err) {
    console.error("Failed to initialize Gemini AI Client:", err);
  }
  async function fetchFromTMDB(endpoint, params = {}) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== void 0 && value !== null && value !== "") {
        url.searchParams.append(key, value);
      }
    });
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
    if (TMDB_READ_ACCESS_TOKEN) {
      headers["Authorization"] = `Bearer ${TMDB_READ_ACCESS_TOKEN}`;
    }
    const response = await fetch(url.toString(), {
      method: "GET",
      headers
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TMDB error ${response.status}: ${errorText || response.statusText}`);
    }
    return response.json();
  }
  app.get("/api/trending/movies", async (req, res) => {
    try {
      const lang = req.query.language || "ar";
      const data = await fetchFromTMDB("/trending/movie/day", { language: lang });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/trending/tv", async (req, res) => {
    try {
      const lang = req.query.language || "ar";
      const data = await fetchFromTMDB("/trending/tv/day", { language: lang });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/popular", async (req, res) => {
    try {
      const lang = req.query.language || "ar";
      const type = req.query.type || "movie";
      const page = req.query.page || "1";
      const endpoint = type === "tv" ? "/tv/popular" : "/movie/popular";
      const data = await fetchFromTMDB(endpoint, { language: lang, page });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/top-rated", async (req, res) => {
    try {
      const lang = req.query.language || "ar";
      const type = req.query.type || "movie";
      const page = req.query.page || "1";
      const endpoint = type === "tv" ? "/tv/top_rated" : "/movie/top_rated";
      const data = await fetchFromTMDB(endpoint, { language: lang, page });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/upcoming", async (req, res) => {
    try {
      const lang = req.query.language || "ar";
      const page = req.query.page || "1";
      const data = await fetchFromTMDB("/movie/upcoming", { language: lang, page });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.query || "";
      const lang = req.query.language || "ar";
      const page = req.query.page || "1";
      if (!query.trim()) {
        return res.json({ results: [] });
      }
      const queryLower = query.toLowerCase();
      let detectedType = "multi";
      if (queryLower.includes("\u0645\u0633\u0644\u0633\u0644") || queryLower.includes("\u0645\u0633\u0644\u0633\u0644\u0627\u062A") || queryLower.includes("\u0628\u0631\u0646\u0627\u0645\u062C") || queryLower.includes("\u0628\u0631\u0627\u0645\u062C") || queryLower.includes("tv") || queryLower.includes("series") || queryLower.includes("show") || queryLower.includes("shows") || queryLower.includes("\u062D\u0644\u0642\u0629") || queryLower.includes("\u062D\u0644\u0642\u0627\u062A") || queryLower.includes("\u0645\u0648\u0633\u0645")) {
        detectedType = "tv";
      } else if (queryLower.includes("\u0641\u064A\u0644\u0645") || queryLower.includes("\u0627\u0641\u0644\u0627\u0645") || queryLower.includes("\u0623\u0641\u0644\u0627\u0645") || queryLower.includes("movie") || queryLower.includes("movies") || queryLower.includes("film") || queryLower.includes("films") || queryLower.includes("\u0633\u064A\u0646\u0645\u0627")) {
        detectedType = "movie";
      }
      const detectedGenres = [];
      if (queryLower.includes("\u0631\u0639\u0628") || queryLower.includes("\u0645\u062E\u064A\u0641") || queryLower.includes("\u0633\u0643\u064A\u0631\u064A") || queryLower.includes("horror") || queryLower.includes("scary")) {
        detectedGenres.push(27);
      }
      if (queryLower.includes("\u0627\u0643\u0634\u0646") || queryLower.includes("\u0623\u0643\u0634\u0646") || queryLower.includes("\u0642\u062A\u0627\u0644") || queryLower.includes("\u062D\u0631\u0643\u0629") || queryLower.includes("\u062D\u0631\u0643\u0647") || queryLower.includes("action") || queryLower.includes("fight")) {
        detectedGenres.push(28);
      }
      if (queryLower.includes("\u0643\u0648\u0645\u064A\u062F") || queryLower.includes("\u0636\u062D\u0643") || queryLower.includes("\u0645\u0636\u062D\u0643") || queryLower.includes("\u0647\u0632\u0644") || queryLower.includes("comedy") || queryLower.includes("funny")) {
        detectedGenres.push(35);
      }
      if (queryLower.includes("\u062E\u064A\u0627\u0644 \u0639\u0644\u0645\u064A") || queryLower.includes("\u0641\u0636\u0627\u0621") || queryLower.includes("\u062A\u0643\u0646\u0648\u0644") || queryLower.includes("sci-fi") || queryLower.includes("scifi") || queryLower.includes("science fiction") || queryLower.includes("space")) {
        detectedGenres.push(878);
      }
      if (queryLower.includes("\u062C\u0631\u064A\u0645") || queryLower.includes("\u0639\u0635\u0627") || queryLower.includes("\u0645\u0627\u0641\u064A\u0627") || queryLower.includes("\u0628\u0648\u0644\u064A\u0633") || queryLower.includes("crime") || queryLower.includes("mafia") || queryLower.includes("police")) {
        detectedGenres.push(80);
      }
      if (queryLower.includes("\u063A\u0645\u0648\u0636") || queryLower.includes("\u063A\u0627\u0632") || queryLower.includes("\u0623\u0644\u063A\u0627\u0632") || queryLower.includes("mystery") || queryLower.includes("thrill") || queryLower.includes("\u062A\u0634\u0648\u064A\u0642") || queryLower.includes("\u0625\u062B\u0627\u0631\u0629") || queryLower.includes("\u0627\u062B\u0627\u0631")) {
        detectedGenres.push(9648);
      }
      if (queryLower.includes("\u0631\u0648\u0645\u0627\u0646\u0633") || queryLower.includes("\u0631\u0648\u0645\u0646\u0633") || queryLower.includes("\u062D\u0628") || queryLower.includes("\u063A\u0631\u0627\u0645") || queryLower.includes("\u0639\u0627\u0637\u0641") || queryLower.includes("romance") || queryLower.includes("romantic") || queryLower.includes("love")) {
        detectedGenres.push(10749);
      }
      if (queryLower.includes("\u0648\u062B\u0627\u0626\u0642") || queryLower.includes("documentary") || queryLower.includes("docu")) {
        detectedGenres.push(99);
      }
      if (queryLower.includes("\u062F\u0631\u0627\u0645") || queryLower.includes("drama") || queryLower.includes("\u062D\u0632\u064A\u0646")) {
        detectedGenres.push(18);
      }
      if (queryLower.includes("\u0639\u0627\u0626\u0644") || queryLower.includes("\u0627\u0637\u0641\u0627\u0644") || queryLower.includes("\u0623\u0637\u0641\u0627\u0644") || queryLower.includes("\u0643\u0631\u062A\u0648\u0646") || queryLower.includes("\u0627\u0646\u0645\u064A") || queryLower.includes("\u0625\u0646\u0645\u064A") || queryLower.includes("family") || queryLower.includes("kids") || queryLower.includes("anime") || queryLower.includes("animation")) {
        detectedGenres.push(10751);
        detectedGenres.push(16);
      }
      if (queryLower.includes("\u0645\u063A\u0627\u0645\u0631") || queryLower.includes("adventure") || queryLower.includes("\u0631\u062D\u0644\u0629")) {
        detectedGenres.push(12);
      }
      if (queryLower.includes("\u0641\u0627\u0646\u062A\u0632") || queryLower.includes("\u062E\u064A\u0627\u0644") || queryLower.includes("\u0633\u062D\u0631") || queryLower.includes("fantasy") || queryLower.includes("magic")) {
        detectedGenres.push(14);
      }
      let data = { results: [] };
      const stopWords = ["\u0641\u064A\u0644\u0645", "\u0627\u0641\u0644\u0627\u0645", "\u0623\u0641\u0644\u0627\u0645", "\u0645\u0633\u0644\u0633\u0644", "\u0645\u0633\u0644\u0633\u0644\u0627\u062A", "\u0628\u0631\u0646\u0627\u0645\u062C", "\u0628\u0631\u0627\u0645\u062C", "\u062D\u0644\u0642\u0629", "\u062D\u0644\u0642\u0627\u062A", "\u0645\u0648\u0633\u0645", "\u0645\u062A\u0631\u062C\u0645", "\u0628\u0644\u0648\u0631\u0627\u064A", "\u0645\u062F\u0628\u0644\u062C", "\u0641\u064A\u062F\u064A\u0648", "\u0645\u0634\u0627\u0647\u062F\u0629", "\u062A\u062D\u0645\u064A\u0644", "movie", "movies", "film", "films", "tv", "show", "shows", "series", "watch", "download", "arabic", "english", "\u0631\u0639\u0628", "\u0627\u0643\u0634\u0646", "\u0623\u0643\u0634\u0646", "\u0643\u0648\u0645\u064A\u062F\u064A", "\u0643\u0648\u0645\u064A\u062F\u064A\u0627", "\u062F\u0631\u0627\u0645\u0627", "\u0631\u0648\u0645\u0627\u0646\u0633\u064A", "\u0631\u0648\u0645\u0646\u0633\u064A", "\u0648\u062B\u0627\u0626\u0642\u064A", "\u062E\u064A\u0627\u0644", "\u0639\u0644\u0645\u064A", "\u063A\u0645\u0648\u0636", "\u0645\u063A\u0627\u0645\u0631\u0629", "\u0645\u063A\u0627\u0645\u0631\u0627\u062A", "\u062C\u0631\u064A\u0645\u0629", "\u0639\u0627\u0626\u0644\u064A", "\u0627\u0637\u0641\u0627\u0644", "\u0623\u0637\u0641\u0627\u0644", "\u0643\u0631\u062A\u0648\u0646", "\u0627\u0646\u0645\u064A", "\u0625\u0646\u0645\u064A", "horror", "action", "comedy", "drama", "romance", "documentary", "scifi", "mystery", "adventure", "crime", "family", "kids", "animation", "anime"];
      let remainingQuery = queryLower;
      for (const word of stopWords) {
        remainingQuery = remainingQuery.replace(new RegExp(`\\b${word}\\b|${word}`, "g"), "");
      }
      remainingQuery = remainingQuery.replace(/\s+/g, " ").trim();
      const yearMatch = queryLower.match(/\b(19\d{2}|20[0-2]\d)\b/);
      const detectedYear = yearMatch ? yearMatch[1] : "";
      if (detectedYear) {
        remainingQuery = remainingQuery.replace(detectedYear, "").replace(/\s+/g, " ").trim();
      }
      if (detectedGenres.length > 0) {
        console.log(`Intelligent Genre discovery classification: Type: ${detectedType}, Genres: ${detectedGenres.join(",")}, Year: ${detectedYear}, Text query: "${remainingQuery}"`);
        let discoverResults = [];
        let totalPages = 1;
        let totalResults = 0;
        if (detectedType === "multi" || detectedType === "movie") {
          let params = {
            language: lang,
            with_genres: detectedGenres.join(","),
            sort_by: "popularity.desc",
            page
          };
          if (detectedYear) {
            params.primary_release_year = detectedYear;
          }
          const movieRes = await fetchFromTMDB("/discover/movie", params);
          const items = (movieRes.results || []).map((x) => ({ ...x, media_type: "movie" }));
          discoverResults = [...discoverResults, ...items];
          totalPages = Math.max(totalPages, movieRes.total_pages || 1);
          totalResults += movieRes.total_results || 0;
        }
        if (detectedType === "multi" || detectedType === "tv") {
          const resolvedTvGenres = detectedGenres.map((g) => {
            if (g === 27) return 9648;
            if (g === 28 || g === 12) return 10759;
            if (g === 878 || g === 14) return 10765;
            if (g === 10749) return 10766;
            return g;
          });
          let params = {
            language: lang,
            with_genres: resolvedTvGenres.join(","),
            sort_by: "popularity.desc",
            page
          };
          if (detectedYear) {
            params.first_air_date_year = detectedYear;
          }
          const tvRes = await fetchFromTMDB("/discover/tv", params);
          const items = (tvRes.results || []).map((x) => ({ ...x, media_type: "tv" }));
          if (detectedType === "multi") {
            const interleaved = [];
            const maxLen = Math.max(discoverResults.length, items.length);
            for (let i = 0; i < maxLen; i++) {
              if (discoverResults[i]) interleaved.push(discoverResults[i]);
              if (items[i]) interleaved.push(items[i]);
            }
            discoverResults = interleaved;
          } else {
            discoverResults = items;
          }
          totalPages = Math.max(totalPages, tvRes.total_pages || 1);
          totalResults += tvRes.total_results || 0;
        }
        if (remainingQuery.length >= 3) {
          let textData = { results: [] };
          try {
            if (detectedType === "movie") {
              const resMovie = await fetchFromTMDB("/search/movie", { query: remainingQuery, language: lang, page });
              textData.results = (resMovie.results || []).map((x) => ({ ...x, media_type: "movie" }));
            } else if (detectedType === "tv") {
              const resTv = await fetchFromTMDB("/search/tv", { query: remainingQuery, language: lang, page });
              textData.results = (resTv.results || []).map((x) => ({ ...x, media_type: "tv" }));
            } else {
              textData = await fetchFromTMDB("/search/multi", { query: remainingQuery, language: lang, page });
            }
          } catch (err) {
            console.error("Textual fallback search failed inside dynamic genre guesser:", err);
          }
          if (textData.results && textData.results.length > 0) {
            const textMatches = textData.results.filter((x) => {
              const itemGenres = x.genre_ids || [];
              return itemGenres.some((g) => detectedGenres.includes(g));
            });
            const otherTextMatches = textData.results.filter((x) => {
              const itemGenres = x.genre_ids || [];
              return !itemGenres.some((g) => detectedGenres.includes(g));
            });
            discoverResults = [...textMatches, ...discoverResults, ...otherTextMatches].slice(0, 20);
          }
        }
        data = {
          results: discoverResults,
          page: Number(page),
          total_pages: totalPages,
          total_results: totalResults
        };
      } else {
        if (detectedType === "movie") {
          const resMovie = await fetchFromTMDB("/search/movie", { query, language: lang, page });
          data = {
            ...resMovie,
            results: (resMovie.results || []).map((x) => ({ ...x, media_type: "movie" }))
          };
        } else if (detectedType === "tv") {
          const resTv = await fetchFromTMDB("/search/tv", { query, language: lang, page });
          data = {
            ...resTv,
            results: (resTv.results || []).map((x) => ({ ...x, media_type: "tv" }))
          };
        } else {
          data = await fetchFromTMDB("/search/multi", { query, language: lang, page });
        }
      }
      if ((!data.results || data.results.length < 4) && detectedGenres.length > 0) {
        console.log("Fusing sparse search indexing results with verified generic category items.");
        const extraRes = await fetchFromTMDB(detectedType === "tv" ? "/discover/tv" : "/discover/movie", {
          language: lang,
          with_genres: detectedGenres.join(","),
          sort_by: "popularity.desc",
          page: "1"
        });
        const extraItems = (extraRes.results || []).map((x) => ({
          ...x,
          media_type: detectedType === "multi" ? "movie" : detectedType
        }));
        data.results = [...data.results || [], ...extraItems].slice(0, 20);
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/genres", async (req, res) => {
    try {
      const lang = req.query.language || "ar";
      const moviesGenres = await fetchFromTMDB("/genre/movie/list", { language: lang });
      const tvGenres = await fetchFromTMDB("/genre/tv/list", { language: lang });
      res.json({
        movie: moviesGenres.genres || [],
        tv: tvGenres.genres || []
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/discover", async (req, res) => {
    try {
      const lang = req.query.language || "ar";
      const type = req.query.type || "movie";
      const page = req.query.page || "1";
      const genreIds = req.query.with_genres || "";
      const primaryReleaseYear = req.query.primary_release_year || "";
      const voteAverageGte = req.query.vote_average_gte || "";
      const runtimeGte = req.query.with_runtime_gte || "";
      const runtimeLte = req.query.with_runtime_lte || "";
      const sortBy = req.query.sort_by || "popularity.desc";
      const endpoint = type === "tv" ? "/discover/tv" : "/discover/movie";
      const params = {
        language: lang,
        page,
        sort_by: sortBy
      };
      if (genreIds) params["with_genres"] = genreIds;
      if (primaryReleaseYear) {
        if (type === "tv") {
          params["first_air_date_year"] = primaryReleaseYear;
        } else {
          params["primary_release_year"] = primaryReleaseYear;
        }
      }
      if (voteAverageGte) params["vote_average.gte"] = voteAverageGte;
      if (runtimeGte) params["with_runtime.gte"] = runtimeGte;
      if (runtimeLte) params["with_runtime.lte"] = runtimeLte;
      const data = await fetchFromTMDB(endpoint, params);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/details/:type/:id", async (req, res) => {
    try {
      const { type, id } = req.params;
      const lang = req.query.language || "ar";
      if (type !== "movie" && type !== "tv") {
        return res.status(400).json({ error: "Invalid type. Must be 'movie' or 'tv'." });
      }
      const [details, credits, videos, recommends, similar, externalIds] = await Promise.allSettled([
        fetchFromTMDB(`/${type}/${id}`, { language: lang }).catch(async (err) => {
          if (lang !== "en") {
            try {
              return await fetchFromTMDB(`/${type}/${id}`, { language: "en" });
            } catch (fallbackErr) {
              console.error("Secondary fallback fetch failed:", fallbackErr);
            }
          }
          throw err;
        }),
        fetchFromTMDB(`/${type}/${id}/credits`, { language: lang }).catch(
          () => fetchFromTMDB(`/${type}/${id}/credits`, { language: "en" }).catch(() => ({ cast: [], crew: [] }))
        ),
        fetchFromTMDB(`/${type}/${id}/videos`, { language: lang }).catch(
          () => fetchFromTMDB(`/${type}/${id}/videos`, { language: "en" }).catch(() => ({ results: [] }))
        ),
        fetchFromTMDB(`/${type}/${id}/recommendations`, { language: lang, page: "1" }).catch(() => ({ results: [] })),
        fetchFromTMDB(`/${type}/${id}/similar`, { language: lang, page: "1" }).catch(() => ({ results: [] })),
        fetchFromTMDB(`/${type}/${id}/external_ids`, { language: lang }).catch(() => ({ imdb_id: null }))
      ]);
      const result = {
        details: details.status === "fulfilled" ? details.value : null,
        credits: credits.status === "fulfilled" ? credits.value : { cast: [], crew: [] },
        videos: videos.status === "fulfilled" ? videos.value : { results: [] },
        recommendations: recommends.status === "fulfilled" ? recommends.value.results || [] : [],
        similar: similar.status === "fulfilled" ? similar.value.results || [] : [],
        externalIds: externalIds.status === "fulfilled" ? externalIds.value : { imdb_id: null }
      };
      if (!result.details) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/tv/:id/season/:season_number", async (req, res) => {
    try {
      const { id, season_number } = req.params;
      const lang = req.query.language || "ar";
      const data = await fetchFromTMDB(`/tv/${id}/season/${season_number}`, { language: lang });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/ai/recommend", async (req, res) => {
    try {
      const { prompt, language = "ar", count = 5 } = req.body;
      if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      let searchQueries = [];
      if (ai) {
        try {
          console.log("Querying Gemini Client for premium AI Recommendations...");
          const systemInstruction = `You are "\u0645\u0627\u0630\u0627 \u0623\u0634\u0627\u0647\u062F\u061F" (What Should I Watch?), an expert cinema & television concierge.
Analyze the user's mood, request, or viewing taste and recommend exactly ${count} movies or TV shows.
You MUST output the result as a strict JSON array.
Each object in the array must have the exact keys:
- "title": Movie/TV show name in English (so we can search it easily on TMDB).
- "mediaType": strictly "movie" or "tv".
- "reason": A customized, persuasive, and engaging note explaining why this specific title fits the user's prompt (Must be written beautifully in ${language}).
CRITICAL: Do not write any markdown wrappers around JSON or extra comments. Return only structural JSON.`;
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `User Request: "${prompt}"
Language: ${language}`,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    title: { type: import_genai.Type.STRING, description: "Official Title in English (so TMDB search returns exact match)" },
                    mediaType: { type: import_genai.Type.STRING, description: "Must be 'movie' or 'tv'" },
                    reason: { type: import_genai.Type.STRING, description: "An engaging personalized description of why this was chosen in the requested language" }
                  },
                  required: ["title", "mediaType", "reason"]
                }
              }
            }
          });
          const responseText = response.text || "[]";
          let parsedData = [];
          try {
            parsedData = JSON.parse(responseText.trim());
          } catch {
            const cleanedText = responseText.replace(/```json|```/g, "").trim();
            parsedData = JSON.parse(cleanedText);
          }
          if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
            searchQueries = parsedData.map((item) => ({
              title: item.title || "",
              mediaType: item.mediaType || "movie",
              reason: item.reason || ""
            })).filter((q) => q.title);
            console.log(`Successfully acquired ${searchQueries.length} recommendations from Gemini API.`);
          }
        } catch (geminiErr) {
          console.error("Gemini premium model search failed, attempting fallback service:", geminiErr);
        }
      }
      if (searchQueries.length === 0) {
        try {
          console.log("GPT service fallback triggered. Requesting recommendations...");
          const targetQuery = `Recommend exactly ${count} movies or TV shows based on request: "${prompt}".
You MUST output the result as a strict, clean JSON array without markdown codeblocks or prefix/suffix words. Just raw JSON.
Each object in the array must have the exact keys:
- "title": Movie/TV show name in English (for TMDB).
- "mediaType": strictly "movie" or "tv".
- "reason": Engaging description of why this was chosen written in ${language}.

Format structure to return:
[{"title": "Title in English", "mediaType": "movie", "reason": "reason why in ${language}"}]`;
          const apiUrl = `https://viscodev.x10.mx/GPT-3.5/api.php?text=${encodeURIComponent(targetQuery)}`;
          const gptResponse = await fetch(apiUrl);
          if (gptResponse.ok) {
            const rawText = await gptResponse.text();
            let parsedData = null;
            try {
              parsedData = JSON.parse(rawText.trim());
            } catch {
              const arrayMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
              if (arrayMatch) {
                parsedData = JSON.parse(arrayMatch[0]);
              }
            }
            if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
              searchQueries = parsedData.map((item) => ({
                title: item.title || "",
                mediaType: item.mediaType || "movie",
                reason: item.reason || ""
              })).filter((q) => q.title);
              console.log(`Successfully acquired ${searchQueries.length} recommendations from GPT-3.5 API fallback.`);
            }
            if (searchQueries.length === 0) {
              const simpleQuery = `Recommend exactly ${count} popular English movie or TV show names corresponding to: "${prompt}". Return ONLY their official English names separated by commas. No numbering, no comments, no preamble, and no markdown. Example: Inception, Breaking Bad, Titanic`;
              const simpleApiUrl = `https://viscodev.x10.mx/GPT-3.5/api.php?text=${encodeURIComponent(simpleQuery)}`;
              const simpleResponse = await fetch(simpleApiUrl);
              if (simpleResponse.ok) {
                const simpleText = await simpleResponse.text();
                const rawTitles = simpleText.split(/,|\n/).map((t) => {
                  return t.replace(/^\s*\d+[\s.)-:/]+/, "").replace(/['"“”]+/g, "").trim();
                }).filter((t) => t.length > 1 && !t.includes(":") && !t.includes("Here are") && !t.includes("recommend"));
                if (rawTitles.length > 0) {
                  searchQueries = rawTitles.slice(0, count).map((title) => ({
                    title,
                    mediaType: "movie",
                    reason: language === "ar" ? `\u062A\u0648\u0635\u064A\u0629 \u0630\u0643\u064A\u0629 \u0645\u062E\u0635\u0635\u0629 \u062A\u062A\u0646\u0627\u0633\u0628 \u0645\u0639 \u0637\u0644\u0628\u0643: "${prompt}"` : `A custom tailored choice fitting your request: "${prompt}"`
                  }));
                }
              }
            }
          }
        } catch (gptError) {
          console.error("Failed to query fallback GPT-3.5 service:", gptError);
        }
      }
      if (searchQueries.length === 0) {
        console.log("Using smart local fallback recommendations engine...");
        const detectedGenres = [];
        const promptLower = prompt.toLowerCase();
        if (promptLower.includes("\u0631\u0639\u0628") || promptLower.includes("horror") || promptLower.includes("scary")) detectedGenres.push(27);
        if (promptLower.includes("\u0627\u0643\u0634\u0646") || promptLower.includes("\u0623\u0643\u0634\u0646") || promptLower.includes("action")) detectedGenres.push(28);
        if (promptLower.includes("\u0643\u0648\u0645\u064A\u062F") || promptLower.includes("comedy")) detectedGenres.push(35);
        if (promptLower.includes("\u062E\u064A\u0627\u0644") || promptLower.includes("sci-fi") || promptLower.includes("science")) detectedGenres.push(878);
        if (promptLower.includes("\u063A\u0645\u0648\u0636") || promptLower.includes("mystery") || promptLower.includes("\u062A\u0634\u0648\u064A\u0642")) detectedGenres.push(9648);
        if (promptLower.includes("\u0631\u0648\u0645\u0627\u0646\u0633") || promptLower.includes("romance") || promptLower.includes("love")) detectedGenres.push(10749);
        if (promptLower.includes("\u062F\u0631\u0627\u0645") || promptLower.includes("drama")) detectedGenres.push(18);
        let items = [];
        if (detectedGenres.length > 0) {
          try {
            const discRes = await fetchFromTMDB("/discover/movie", {
              language,
              with_genres: detectedGenres.join(","),
              sort_by: "popularity.desc",
              page: "1"
            });
            items = (discRes.results || []).slice(0, count);
          } catch (discErr) {
            console.error("Local classification discover query failed:", discErr);
          }
        }
        if (items.length === 0) {
          try {
            const trending = await fetchFromTMDB("/trending/movie/day", { language });
            items = (trending.results || []).slice(0, count);
          } catch (trendErr) {
            console.error("Trending fallback failed:", trendErr);
          }
        }
        searchQueries = items.map((item) => ({
          title: item.title || item.original_title || "Inception",
          mediaType: "movie",
          reason: language === "ar" ? "\u0641\u064A\u0644\u0645 \u0631\u0627\u0626\u0639 \u064A\u062A\u0645\u0627\u0634\u0649 \u0645\u0639 \u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A\u0643 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0634\u0639\u0628\u064A\u062A\u0647 \u0648\u062A\u0642\u064A\u064A\u0645\u0627\u062A\u0647 \u0627\u0644\u0639\u0627\u0644\u064A\u0629." : "An amazing, highly-rated and popular choice corresponding to your interests."
        }));
      }
      const richRecommendations = await Promise.all(
        searchQueries.map(async (queryItem) => {
          try {
            const searchData = await fetchFromTMDB("/search/multi", {
              query: queryItem.title,
              language
            });
            const findBestMatch = (searchData.results || []).find(
              (r) => r.media_type === queryItem.mediaType || r.title || r.name
            ) || searchData.results?.[0];
            if (findBestMatch) {
              return {
                ...findBestMatch,
                ai_reason: queryItem.reason,
                media_type: queryItem.mediaType || findBestMatch.media_type
              };
            }
            return null;
          } catch (err) {
            console.error(`Error searching title "${queryItem.title}":`, err);
            return null;
          }
        })
      );
      const validRecommendations = richRecommendations.filter(Boolean);
      res.json(validRecommendations);
    } catch (error) {
      console.error("AI recommend handler failed:", error);
      res.status(500).json({ error: error.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on http://localhost:${PORT}`);
  });
}
startServer().catch((e) => {
  console.error("Fatal exception during startServer booting:", e);
});
//# sourceMappingURL=server.cjs.map
