import React, { createContext, useContext, useState, useEffect } from "react";
import { MediaItem } from "../types";

interface WatchContextProps {
  watchlist: MediaItem[];
  favorites: MediaItem[];
  watched: MediaItem[];
  searchHistory: string[];
  addToWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: number) => void;
  toggleWatchlist: (item: MediaItem) => void;
  addToFavorites: (item: MediaItem) => void;
  removeFromFavorites: (id: number) => void;
  toggleFavorite: (item: MediaItem) => void;
  addToWatched: (item: MediaItem) => void;
  removeFromWatched: (id: number) => void;
  toggleWatched: (item: MediaItem) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  inWatchlist: (id: number) => boolean;
  inFavorites: (id: number) => boolean;
  inWatched: (id: number) => boolean;
}

const WatchContext = createContext<WatchContextProps | undefined>(undefined);

export const WatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
  const [favorites, setFavorites] = useState<MediaItem[]>([]);
  const [watched, setWatched] = useState<MediaItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load from local storage
  useEffect(() => {
    try {
      const storedWatchlist = localStorage.getItem("watchlist");
      const storedFavorites = localStorage.getItem("favorites");
      const storedWatched = localStorage.getItem("watched");
      const storedHistory = localStorage.getItem("search_history");

      if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      if (storedWatched) setWatched(JSON.parse(storedWatched));
      if (storedHistory) setSearchHistory(JSON.parse(storedHistory));
    } catch (e) {
      console.error("Failed to load local storage lists:", e);
    }
  }, []);

  // Save to local storage helpers
  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addToWatchlist = (item: MediaItem) => {
    if (!watchlist.some((x) => x.id === item.id)) {
      const updated = [item, ...watchlist];
      setWatchlist(updated);
      saveToLocalStorage("watchlist", updated);
    }
  };

  const removeFromWatchlist = (id: number) => {
    const updated = watchlist.filter((x) => x.id !== id);
    setWatchlist(updated);
    saveToLocalStorage("watchlist", updated);
  };

  const toggleWatchlist = (item: MediaItem) => {
    if (watchlist.some((x) => x.id === item.id)) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  };

  const addToFavorites = (item: MediaItem) => {
    if (!favorites.some((x) => x.id === item.id)) {
      const updated = [item, ...favorites];
      setFavorites(updated);
      saveToLocalStorage("favorites", updated);
    }
  };

  const removeFromFavorites = (id: number) => {
    const updated = favorites.filter((x) => x.id !== id);
    setFavorites(updated);
    saveToLocalStorage("favorites", updated);
  };

  const toggleFavorite = (item: MediaItem) => {
    if (favorites.some((x) => x.id === item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  const addToWatched = (item: MediaItem) => {
    if (!watched.some((x) => x.id === item.id)) {
      const updated = [item, ...watched];
      setWatched(updated);
      saveToLocalStorage("watched", updated);
    }
  };

  const removeFromWatched = (id: number) => {
    const updated = watched.filter((x) => x.id !== id);
    setWatched(updated);
    saveToLocalStorage("watched", updated);
  };

  const toggleWatched = (item: MediaItem) => {
    if (watched.some((x) => x.id === item.id)) {
      removeFromWatched(item.id);
    } else {
      addToWatched(item);
    }
  };

  const addToSearchHistory = (query: string) => {
    if (!query || !query.trim()) return;
    const cleanQuery = query.trim();
    const filtered = searchHistory.filter((x) => x.toLowerCase() !== cleanQuery.toLowerCase());
    const updated = [cleanQuery, ...filtered].slice(0, 10); // Keep last 10 searches
    setSearchHistory(updated);
    saveToLocalStorage("search_history", updated);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    saveToLocalStorage("search_history", []);
  };

  const inWatchlist = (id: number) => watchlist.some((x) => x.id === id);
  const inFavorites = (id: number) => favorites.some((x) => x.id === id);
  const inWatched = (id: number) => watched.some((x) => x.id === id);

  return (
    <WatchContext.Provider
      value={{
        watchlist,
        favorites,
        watched,
        searchHistory,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        addToWatched,
        removeFromWatched,
        toggleWatched,
        addToSearchHistory,
        clearSearchHistory,
        inWatchlist,
        inFavorites,
        inWatched
      }}
    >
      {children}
    </WatchContext.Provider>
  );
};

export const useWatchContext = () => {
  const context = useContext(WatchContext);
  if (!context) {
    throw new Error("useWatchContext must be used within a WatchProvider");
  }
  return context;
};
