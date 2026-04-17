import "../css/Home.css";
import MovieCard from "../components/MovieCard";
import AdvancedSearch from "../components/AdvancedSearch";
import { getPopularMovies, advancedSearch } from "../services/api";
import { useRecommendations } from "../../contexts/RecommendationContext"; // FIX E6: contexts is at root
import { useState, useEffect } from "react";

function Home() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFiltered, setIsFiltered] = useState(false);

  const { recommendations, poolLoading } = useRecommendations();

  // Load popular movies on mount
  useEffect(() => {
    (async () => {
      try {
        const popularMovies = await getPopularMovies();
        setMovies(popularMovies);
      } catch {
        setError("Failed to fetch popular movies.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = async (filters) => {
    // Empty filters → restore popular
    const hasAnyFilter =
      filters.query ||
      filters.genreIds?.length ||
      filters.minRating ||
      filters.maxRating ||
      filters.yearFrom ||
      filters.yearTo ||
      filters.actorId ||
      filters.directorId;

    if (!hasAnyFilter) {
      setIsFiltered(false);
      setLoading(true);
      try {
        setMovies(await getPopularMovies());
        setError(null);
      } catch {
        setError("Failed to fetch popular movies.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setIsFiltered(true);
    try {
      const results = await advancedSearch(filters);
      setMovies(results);
      setError(
        results.length === 0 ? "No movies found for these filters." : null,
      );
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Advanced Search bar + filter panel */}
      <AdvancedSearch onSearch={handleSearch} loading={loading} />

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading…</div>}

      {/* KNN Recommendations */}
      {!isFiltered && recommendations.length > 0 && (
        <section className="recommendations-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="knn-badge">KNN</span>
              Recommended For You
            </h2>
            <p className="section-subtitle">
              Based on your favorites · powered by K-Nearest Neighbours
            </p>
          </div>
          {poolLoading ? (
            <div className="loading">Building recommendations…</div>
          ) : (
            <div className="movies-grid">
              {recommendations.map((movie) => (
                <MovieCard movie={movie} key={`rec-${movie.id}`} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Popular / Search / Filtered Results */}
      <section className="popular-section">
        <h2 className="section-title">
          {isFiltered ? "Search Results" : "Popular Movies"}
        </h2>
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
