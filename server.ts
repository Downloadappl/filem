import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Load TMDB Credentials
  const TMDB_READ_ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjM2VhNDNlN2ZkMzczNDFiNWIyNjgwOTZiZWY3ZDY2MyIsIm5iZiI6MTc3MDU2NDMyNi4xMzkwMDAyLCJzdWIiOiI2OTg4YWFlNjg1N2JmYWEwMjE1Y2FhMzAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Z0llbzQvZtmkc6AlY0Zq7y2k-BCBH_0BbpYAmtRJi4c";
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  // Set up Gemini AI Client (lazily evaluated or safe fallbacks)
  let ai: GoogleGenAI | null = null;
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
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

  // Reusable fetch helper for TMDB api requests
  async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (TMDB_READ_ACCESS_TOKEN) {
      headers["Authorization"] = `Bearer ${TMDB_READ_ACCESS_TOKEN}`;
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TMDB error ${response.status}: ${errorText || response.statusText}`);
    }

    return response.json();
  }

  // 🍿 API ROUTES FIRST 🍿

  // 1. Trending Movies
  app.get("/api/trending/movies", async (req, res) => {
    try {
      const lang = (req.query.language as string) || "ar";
      const data = await fetchFromTMDB("/trending/movie/day", { language: lang });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Trending TV Shows
  app.get("/api/trending/tv", async (req, res) => {
    try {
      const lang = (req.query.language as string) || "ar";
      const data = await fetchFromTMDB("/trending/tv/day", { language: lang });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Popular Content
  app.get("/api/popular", async (req, res) => {
    try {
      const lang = (req.query.language as string) || "ar";
      const type = (req.query.type as string) || "movie"; // 'movie' or 'tv'
      const page = (req.query.page as string) || "1";
      const endpoint = type === "tv" ? "/tv/popular" : "/movie/popular";
      const data = await fetchFromTMDB(endpoint, { language: lang, page });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Top Rated Content
  app.get("/api/top-rated", async (req, res) => {
    try {
      const lang = (req.query.language as string) || "ar";
      const type = (req.query.type as string) || "movie"; // 'movie' or 'tv'
      const page = (req.query.page as string) || "1";
      const endpoint = type === "tv" ? "/tv/top_rated" : "/movie/top_rated";
      const data = await fetchFromTMDB(endpoint, { language: lang, page });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Upcoming Movies
  app.get("/api/upcoming", async (req, res) => {
    try {
      const lang = (req.query.language as string) || "ar";
      const page = (req.query.page as string) || "1";
      const data = await fetchFromTMDB("/movie/upcoming", { language: lang, page });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 6. Multi-Search & Autocomplete suggestions (with Intelligent Genre and Media Type classification)
  app.get("/api/search", async (req, res) => {
    try {
      const query = (req.query.query as string) || "";
      const lang = (req.query.language as string) || "ar";
      const page = (req.query.page as string) || "1";
      if (!query.trim()) {
        return res.json({ results: [] });
      }

      const queryLower = query.toLowerCase();

      // Guess media type: default to "multi" unless "tv" or "movie" words are matched
      let detectedType: "movie" | "tv" | "multi" = "multi";
      if (
        queryLower.includes("مسلسل") || 
        queryLower.includes("مسلسلات") || 
        queryLower.includes("برنامج") || 
        queryLower.includes("برامج") || 
        queryLower.includes("tv") || 
        queryLower.includes("series") || 
        queryLower.includes("show") || 
        queryLower.includes("shows") || 
        queryLower.includes("حلقة") || 
        queryLower.includes("حلقات") || 
        queryLower.includes("موسم")
      ) {
        detectedType = "tv";
      } else if (
        queryLower.includes("فيلم") || 
        queryLower.includes("افلام") || 
        queryLower.includes("أفلام") || 
        queryLower.includes("movie") || 
        queryLower.includes("movies") || 
        queryLower.includes("film") || 
        queryLower.includes("films") || 
        queryLower.includes("سينما")
      ) {
        detectedType = "movie";
      }

      // Detect Genres based on Arabic and English keywords
      const detectedGenres: number[] = [];
      
      // Horror (رعب)
      if (queryLower.includes("رعب") || queryLower.includes("مخيف") || queryLower.includes("سكيري") || queryLower.includes("horror") || queryLower.includes("scary")) {
        detectedGenres.push(27);
      }
      // Action (أكشن / قتال / حركة)
      if (queryLower.includes("اكشن") || queryLower.includes("أكشن") || queryLower.includes("قتال") || queryLower.includes("حركة") || queryLower.includes("حركه") || queryLower.includes("action") || queryLower.includes("fight")) {
        detectedGenres.push(28);
      }
      // Comedy (كوميدي / ضحك)
      if (queryLower.includes("كوميد") || queryLower.includes("ضحك") || queryLower.includes("مضحك") || queryLower.includes("هزل") || queryLower.includes("comedy") || queryLower.includes("funny")) {
        detectedGenres.push(35);
      }
      // Sci-Fi (خيال علمي / فضاء)
      if (queryLower.includes("خيال علمي") || queryLower.includes("فضاء") || queryLower.includes("تكنول") || queryLower.includes("sci-fi") || queryLower.includes("scifi") || queryLower.includes("science fiction") || queryLower.includes("space")) {
        detectedGenres.push(878);
      }
      // Crime (جريمة / عصابات)
      if (queryLower.includes("جريم") || queryLower.includes("عصا") || queryLower.includes("مافيا") || queryLower.includes("بوليس") || queryLower.includes("crime") || queryLower.includes("mafia") || queryLower.includes("police")) {
        detectedGenres.push(80);
      }
      // Mystery (غموض / الغاز)
      if (queryLower.includes("غموض") || queryLower.includes("غاز") || queryLower.includes("ألغاز") || queryLower.includes("mystery") || queryLower.includes("thrill") || queryLower.includes("تشويق") || queryLower.includes("إثارة") || queryLower.includes("اثار")) {
        detectedGenres.push(9648);
      }
      // Romance (رومانسي)
      if (queryLower.includes("رومانس") || queryLower.includes("رومنس") || queryLower.includes("حب") || queryLower.includes("غرام") || queryLower.includes("عاطف") || queryLower.includes("romance") || queryLower.includes("romantic") || queryLower.includes("love")) {
        detectedGenres.push(10749);
      }
      // Documentary (وثائقي)
      if (queryLower.includes("وثائق") || queryLower.includes("documentary") || queryLower.includes("docu")) {
        detectedGenres.push(99);
      }
      // Drama (دراما)
      if (queryLower.includes("درام") || queryLower.includes("drama") || queryLower.includes("حزين")) {
        detectedGenres.push(18);
      }
      // Family / Kids (عائلي / اطفال)
      if (queryLower.includes("عائل") || queryLower.includes("اطفال") || queryLower.includes("أطفال") || queryLower.includes("كرتون") || queryLower.includes("انمي") || queryLower.includes("إنمي") || queryLower.includes("family") || queryLower.includes("kids") || queryLower.includes("anime") || queryLower.includes("animation")) {
        detectedGenres.push(10751);
        detectedGenres.push(16);
      }
      // Adventure (مغامرة)
      if (queryLower.includes("مغامر") || queryLower.includes("adventure") || queryLower.includes("رحلة")) {
        detectedGenres.push(12);
      }
      // Fantasy (خيال / فانتزيا)
      if (queryLower.includes("فانتز") || queryLower.includes("خيال") || queryLower.includes("سحر") || queryLower.includes("fantasy") || queryLower.includes("magic")) {
        detectedGenres.push(14);
      }

      let data: any = { results: [] };

      // Identify if the search query is mostly a structural category search (e.g., "أفلام رعب" or simply "كوميديا")
      const stopWords = ["فيلم", "افلام", "أفلام", "مسلسل", "مسلسلات", "برنامج", "برامج", "حلقة", "حلقات", "موسم", "مترجم", "بلوراي", "مدبلج", "فيديو", "مشاهدة", "تحميل", "movie", "movies", "film", "films", "tv", "show", "shows", "series", "watch", "download", "arabic", "english", "رعب", "اكشن", "أكشن", "كوميدي", "كوميديا", "دراما", "رومانسي", "رومنسي", "وثائقي", "خيال", "علمي", "غموض", "مغامرة", "مغامرات", "جريمة", "عائلي", "اطفال", "أطفال", "كرتون", "انمي", "إنمي", "horror", "action", "comedy", "drama", "romance", "documentary", "scifi", "mystery", "adventure", "crime", "family", "kids", "animation", "anime"];
      let remainingQuery = queryLower;
      for (const word of stopWords) {
        remainingQuery = remainingQuery.replace(new RegExp(`\\b${word}\\b|${word}`, "g"), "");
      }
      remainingQuery = remainingQuery.replace(/\s+/g, " ").trim();

      // Extract optional 4-digit release year (e.g. 1900-2029) from user query to support "أفلام 2024" or "أكشن 2023"
      const yearMatch = queryLower.match(/\b(19\d{2}|20[0-2]\d)\b/);
      const detectedYear = yearMatch ? yearMatch[1] : "";
      if (detectedYear) {
        remainingQuery = remainingQuery.replace(detectedYear, "").replace(/\s+/g, " ").trim();
      }

      // Classify as pure category discover if any genre or classification was guessed/implied
      if (detectedGenres.length > 0) {
        console.log(`Intelligent Genre discovery classification: Type: ${detectedType}, Genres: ${detectedGenres.join(",")}, Year: ${detectedYear}, Text query: "${remainingQuery}"`);
        
        let discoverResults: any[] = [];
        let totalPages = 1;
        let totalResults = 0;

        // Fetch movies meeting the guessed classification
        if (detectedType === "multi" || detectedType === "movie") {
          let params: any = {
            language: lang,
            with_genres: detectedGenres.join(","),
            sort_by: "popularity.desc",
            page
          };
          if (detectedYear) {
            params.primary_release_year = detectedYear;
          }
          const movieRes = await fetchFromTMDB("/discover/movie", params);
          const items = (movieRes.results || []).map((x: any) => ({ ...x, media_type: "movie" }));
          discoverResults = [...discoverResults, ...items];
          totalPages = Math.max(totalPages, movieRes.total_pages || 1);
          totalResults += movieRes.total_results || 0;
        }

        // Fetch TV series meeting the guessed classification
        if (detectedType === "multi" || detectedType === "tv") {
          const resolvedTvGenres = detectedGenres.map(g => {
            if (g === 27) return 9648; // Horror maps to Mystery on TV
            if (g === 28 || g === 12) return 10759; // Action & Adventure maps to Action & Adventure (10759) on TV
            if (g === 878 || g === 14) return 10765; // Sci-Fi & Fantasy maps to Sci-Fi & Fantasy (10765) on TV
            if (g === 10749) return 10766; // Romance maps to Soap (10766) on TV
            return g;
          });

          let params: any = {
            language: lang,
            with_genres: resolvedTvGenres.join(","),
            sort_by: "popularity.desc",
            page
          };
          if (detectedYear) {
            params.first_air_date_year = detectedYear;
          }
          const tvRes = await fetchFromTMDB("/discover/tv", params);
          const items = (tvRes.results || []).map((x: any) => ({ ...x, media_type: "tv" }));
          
          if (detectedType === "multi") {
            // Interleave movie and tv results beautifully
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

        // If the user's input contains other descriptive keywords, run a text search and hybridize them
        if (remainingQuery.length >= 3) {
          let textData: any = { results: [] };
          try {
            if (detectedType === "movie") {
              const resMovie = await fetchFromTMDB("/search/movie", { query: remainingQuery, language: lang, page });
              textData.results = (resMovie.results || []).map((x: any) => ({ ...x, media_type: "movie" }));
            } else if (detectedType === "tv") {
              const resTv = await fetchFromTMDB("/search/tv", { query: remainingQuery, language: lang, page });
              textData.results = (resTv.results || []).map((x: any) => ({ ...x, media_type: "tv" }));
            } else {
              textData = await fetchFromTMDB("/search/multi", { query: remainingQuery, language: lang, page });
            }
          } catch (err) {
            console.error("Textual fallback search failed inside dynamic genre guesser:", err);
          }

          if (textData.results && textData.results.length > 0) {
            // Merge textual search results, prioritizing titles that overlap with our guessed genre IDs
            const textMatches = textData.results.filter((x: any) => {
              const itemGenres = x.genre_ids || [];
              return itemGenres.some((g: number) => detectedGenres.includes(g));
            });

            const otherTextMatches = textData.results.filter((x: any) => {
              const itemGenres = x.genre_ids || [];
              return !itemGenres.some((g: number) => detectedGenres.includes(g));
            });

            // Reassemble dynamically: categorized matches first, then discover recommendations, then other raw search suggestions
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
        // Run specific TMDB search indices
        if (detectedType === "movie") {
          const resMovie = await fetchFromTMDB("/search/movie", { query, language: lang, page });
          data = {
            ...resMovie,
            results: (resMovie.results || []).map((x: any) => ({ ...x, media_type: "movie" }))
          };
        } else if (detectedType === "tv") {
          const resTv = await fetchFromTMDB("/search/tv", { query, language: lang, page });
          data = {
            ...resTv,
            results: (resTv.results || []).map((x: any) => ({ ...x, media_type: "tv" }))
          };
        } else {
          data = await fetchFromTMDB("/search/multi", { query, language: lang, page });
        }
      }

      // Populate empty results if a specific category was searched but returned empty or scarce items due to name search limits
      if ((!data.results || data.results.length < 4) && detectedGenres.length > 0) {
        console.log("Fusing sparse search indexing results with verified generic category items.");
        const extraRes = await fetchFromTMDB(detectedType === "tv" ? "/discover/tv" : "/discover/movie", {
          language: lang,
          with_genres: detectedGenres.join(","),
          sort_by: "popularity.desc",
          page: "1"
        });
        const extraItems = (extraRes.results || []).map((x: any) => ({ 
          ...x, 
          media_type: detectedType === "multi" ? "movie" : detectedType 
        }));
        data.results = [...(data.results || []), ...extraItems].slice(0, 20);
      }

      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 7. Genres (Unified for Movie & TV)
  app.get("/api/genres", async (req, res) => {
    try {
      const lang = (req.query.language as string) || "ar";
      const moviesGenres = await fetchFromTMDB("/genre/movie/list", { language: lang });
      const tvGenres = await fetchFromTMDB("/genre/tv/list", { language: lang });
      res.json({
        movie: moviesGenres.genres || [],
        tv: tvGenres.genres || []
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 8. Dynamic Discover filter endpoint
  app.get("/api/discover", async (req, res) => {
    try {
      const lang = (req.query.language as string) || "ar";
      const type = (req.query.type as string) || "movie"; // 'movie' or 'tv'
      const page = (req.query.page as string) || "1";
      const genreIds = (req.query.with_genres as string) || "";
      const primaryReleaseYear = (req.query.primary_release_year as string) || "";
      const voteAverageGte = (req.query.vote_average_gte as string) || "";
      const runtimeGte = (req.query.with_runtime_gte as string) || "";
      const runtimeLte = (req.query.with_runtime_lte as string) || "";
      const sortBy = (req.query.sort_by as string) || "popularity.desc";

      const endpoint = type === "tv" ? "/discover/tv" : "/discover/movie";
      const params: Record<string, string> = {
        language: lang,
        page,
        sort_by: sortBy,
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 9. Consolidated Details Page payload
  app.get("/api/details/:type/:id", async (req, res) => {
    try {
      const { type, id } = req.params;
      const lang = (req.query.language as string) || "ar";
      
      if (type !== "movie" && type !== "tv") {
        return res.status(400).json({ error: "Invalid type. Must be 'movie' or 'tv'." });
      }

      // Fetch details, credits, videos, recommendations, and external IDs in parallel with robust fallbacks
      const [details, credits, videos, recommends, similar, externalIds] = await Promise.allSettled([
        fetchFromTMDB(`/${type}/${id}`, { language: lang }).catch(async (err) => {
          // Fallback to English if localized request fails
          if (lang !== "en") {
            try {
              return await fetchFromTMDB(`/${type}/${id}`, { language: "en" });
            } catch (fallbackErr) {
              console.error("Secondary fallback fetch failed:", fallbackErr);
            }
          }
          throw err;
        }),
        fetchFromTMDB(`/${type}/${id}/credits`, { language: lang }).catch(() => 
          fetchFromTMDB(`/${type}/${id}/credits`, { language: "en" }).catch(() => ({ cast: [], crew: [] }))
        ),
        fetchFromTMDB(`/${type}/${id}/videos`, { language: lang }).catch(() => 
          fetchFromTMDB(`/${type}/${id}/videos`, { language: "en" }).catch(() => ({ results: [] }))
        ),
        fetchFromTMDB(`/${type}/${id}/recommendations`, { language: lang, page: "1" }).catch(() => ({ results: [] })),
        fetchFromTMDB(`/${type}/${id}/similar`, { language: lang, page: "1" }).catch(() => ({ results: [] })),
        fetchFromTMDB(`/${type}/${id}/external_ids`, { language: lang }).catch(() => ({ imdb_id: null }))
      ]);

      const result: any = {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 10. TV Season Details
  app.get("/api/tv/:id/season/:season_number", async (req, res) => {
    try {
      const { id, season_number } = req.params;
      const lang = (req.query.language as string) || "ar";
      const data = await fetchFromTMDB(`/tv/${id}/season/${season_number}`, { language: lang });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 11. AI-Powered Recommendation Engine via Gemini first, with robust custom API fallbacks
  app.post("/api/ai/recommend", async (req, res) => {
    try {
      const { prompt, language = "ar", count = 5 } = req.body;
      if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      let searchQueries: Array<{ title: string; mediaType: string; reason: string }> = [];

      // 1. Try Gemini (Google GenAI SDK) first as the premium standard
      if (ai) {
        try {
          console.log("Querying Gemini Client for premium AI Recommendations...");
          const systemInstruction = `You are "ماذا أشاهد؟" (What Should I Watch?), an expert cinema & television concierge.
Analyze the user's mood, request, or viewing taste and recommend exactly ${count} movies or TV shows.
You MUST output the result as a strict JSON array.
Each object in the array must have the exact keys:
- "title": Movie/TV show name in English (so we can search it easily on TMDB).
- "mediaType": strictly "movie" or "tv".
- "reason": A customized, persuasive, and engaging note explaining why this specific title fits the user's prompt (Must be written beautifully in ${language}).
CRITICAL: Do not write any markdown wrappers around JSON or extra comments. Return only structural JSON.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `User Request: "${prompt}"\nLanguage: ${language}`,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Official Title in English (so TMDB search returns exact match)" },
                    mediaType: { type: Type.STRING, description: "Must be 'movie' or 'tv'" },
                    reason: { type: Type.STRING, description: "An engaging personalized description of why this was chosen in the requested language" }
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
            searchQueries = parsedData.map(item => ({
              title: item.title || "",
              mediaType: item.mediaType || "movie",
              reason: item.reason || ""
            })).filter(q => q.title);
            console.log(`Successfully acquired ${searchQueries.length} recommendations from Gemini API.`);
          }
        } catch (geminiErr) {
          console.error("Gemini premium model search failed, attempting fallback service:", geminiErr);
        }
      }

      // 2. Fallback to ViscoDev GPT-3.5 API if Gemini wasn't initialized or failed to yield results
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
            let parsedData: any = null;
            try {
              parsedData = JSON.parse(rawText.trim());
            } catch {
              const arrayMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
              if (arrayMatch) {
                parsedData = JSON.parse(arrayMatch[0]);
              }
            }

            if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
              searchQueries = parsedData.map(item => ({
                title: item.title || "",
                mediaType: item.mediaType || "movie",
                reason: item.reason || ""
              })).filter(q => q.title);
              console.log(`Successfully acquired ${searchQueries.length} recommendations from GPT-3.5 API fallback.`);
            }

            // Secondary search parser if JSON parsing failed
            if (searchQueries.length === 0) {
              const simpleQuery = `Recommend exactly ${count} popular English movie or TV show names corresponding to: "${prompt}". Return ONLY their official English names separated by commas. No numbering, no comments, no preamble, and no markdown. Example: Inception, Breaking Bad, Titanic`;
              const simpleApiUrl = `https://viscodev.x10.mx/GPT-3.5/api.php?text=${encodeURIComponent(simpleQuery)}`;
              const simpleResponse = await fetch(simpleApiUrl);
              if (simpleResponse.ok) {
                const simpleText = await simpleResponse.text();
                const rawTitles = simpleText.split(/,|\n/).map(t => {
                  return t.replace(/^\s*\d+[\s.)-:/]+/, "").replace(/['"“”]+/g, "").trim();
                }).filter(t => t.length > 1 && !t.includes(":") && !t.includes("Here are") && !t.includes("recommend"));

                if (rawTitles.length > 0) {
                  searchQueries = rawTitles.slice(0, count).map(title => ({
                    title,
                    mediaType: "movie",
                    reason: language === "ar"
                      ? `توصية ذكية مخصصة تتناسب مع طلبك: "${prompt}"`
                      : `A custom tailored choice fitting your request: "${prompt}"`
                  }));
                }
              }
            }
          }
        } catch (gptError) {
          console.error("Failed to query fallback GPT-3.5 service:", gptError);
        }
      }

      // 3. Last-resort fallback to Trending list or smart category filter if both APIs fail
      if (searchQueries.length === 0) {
        console.log("Using smart local fallback recommendations engine...");
        // Guess genre keywords from user's descriptive prompt
        const detectedGenres: number[] = [];
        const promptLower = prompt.toLowerCase();
        if (promptLower.includes("رعب") || promptLower.includes("horror") || promptLower.includes("scary")) detectedGenres.push(27);
        if (promptLower.includes("اكشن") || promptLower.includes("أكشن") || promptLower.includes("action")) detectedGenres.push(28);
        if (promptLower.includes("كوميد") || promptLower.includes("comedy")) detectedGenres.push(35);
        if (promptLower.includes("خيال") || promptLower.includes("sci-fi") || promptLower.includes("science")) detectedGenres.push(878);
        if (promptLower.includes("غموض") || promptLower.includes("mystery") || promptLower.includes("تشويق")) detectedGenres.push(9648);
        if (promptLower.includes("رومانس") || promptLower.includes("romance") || promptLower.includes("love")) detectedGenres.push(10749);
        if (promptLower.includes("درام") || promptLower.includes("drama")) detectedGenres.push(18);

        let items: any[] = [];
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

        searchQueries = items.map((item: any) => ({
          title: item.title || item.original_title || "Inception",
          mediaType: "movie",
          reason: language === "ar" 
            ? "فيلم رائع يتماشى مع اهتماماتك بناءً على شعبيته وتقييماته العالية." 
            : "An amazing, highly-rated and popular choice corresponding to your interests."
        }));
      }

      // Map searchQueries to rich TMDB objects
      const richRecommendations = await Promise.all(
        searchQueries.map(async (queryItem) => {
          try {
            const searchData = await fetchFromTMDB("/search/multi", {
              query: queryItem.title,
              language: language
            });
            const findBestMatch = (searchData.results || []).find(
              (r: any) => r.media_type === queryItem.mediaType || r.title || r.name
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
    } catch (error: any) {
      console.error("AI recommend handler failed:", error);
      res.status(500).json({ error: error.message });
    }
  });


  // 📦 VITE MIDDLEWARE / PRODUCTION FILE DISTRIBUTOR 📦

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // SPA Fallback
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on http://localhost:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Fatal exception during startServer booting:", e);
});
