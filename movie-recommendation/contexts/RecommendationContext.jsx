import { createContext, useContext, useState, useEffect } from "react";
import { useMovieContext } from "./MovieContext";
import { getLargeMoviePool } from "../src/services/api";
import {
  attachVectors,
  buildProfileVector,
  knnQuery,
} from "../src/services/knn";

const RecommendationContext = createContext();

export function RecommendationProvider({ children }) {
  const { favorites } = useMovieContext();
  const [pool, setPool] = useState([]);
  const [poolLoading, setPoolLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  // Load candidate pool once on mount
  useEffect(() => {
    (async () => {
      try {
        const movies = await getLargeMoviePool(5);
        attachVectors(movies);
        setPool(movies);
      } catch (err) {
        console.error("Failed to load movie pool:", err);
      } finally {
        setPoolLoading(false);
      }
    })();
  }, []);

  // Re-run KNN whenever favorites or pool changes
  useEffect(() => {
    if (!pool.length || !favorites.length) {
      setRecommendations([]);
      return;
    }

    const favsWithVectors = favorites.map((fav) => ({
      ...fav,
      _vec: fav._vec || pool.find((m) => m.id === fav.id)?._vec,
    }));

    const profileVec = buildProfileVector(favsWithVectors);
    if (!profileVec) {
      setRecommendations([]);
      return;
    }

    const excludeIds = new Set(favorites.map((f) => f.id));
    const recs = knnQuery(profileVec, pool, excludeIds, 10);
    setRecommendations(recs);
  }, [favorites, pool]);

  return (
    <RecommendationContext.Provider value={{ recommendations, poolLoading }}>
      {children}
    </RecommendationContext.Provider>
  );
}

export function useRecommendations() {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error(
      "useRecommendations must be used within a RecommendationProvider",
    );
  }
  return context;
}
