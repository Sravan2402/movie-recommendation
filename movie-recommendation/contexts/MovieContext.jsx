import { createContext, useState, useContext, useEffect } from "react";

const MovieContext = createContext();

export function MovieProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favorites")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (movie) => {
    setFavorites((prev) =>
      prev.some((m) => m.id === movie.id) ? prev : [...prev, movie],
    );
  };

  const removeFavorite = (movieId) => {
    setFavorites((prev) => prev.filter((m) => m.id !== movieId));
  };

  const isFavorite = (movieId) => favorites.some((m) => m.id === movieId);

  return (
    <MovieContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite }}
    >
      {children}
    </MovieContext.Provider>
  );
}

export function useMovieContext() {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error("useMovieContext must be used within a MovieProvider");
  }
  return context;
}
