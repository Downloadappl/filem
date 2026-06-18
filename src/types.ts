export interface MediaItem {
  id: number;
  title?: string; // Movies
  name?: string;  // TV Shows
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string; // Movies
  first_air_date?: string; // TV Shows
  media_type?: "movie" | "tv";
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number; // Movies
  episode_run_time?: number[]; // TV
  number_of_seasons?: number; // TV Show Details
  number_of_episodes?: number; // TV Show Details
  seasons?: Season[]; // TV Show Details
  ai_reason?: string; // Custom AI assistant suggestion reason
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  job?: string;
  department?: string;
  profile_path: string | null;
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface Season {
  id: number;
  air_date: string | null;
  episode_count: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  still_path: string | null;
  vote_average: number;
  air_date: string | null;
}

export interface SearchSuggestion {
  id: number;
  title?: string;
  name?: string;
  media_type: "movie" | "tv" | "person";
  poster_path?: string | null;
  profile_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

export type ThemeType = "dark";
