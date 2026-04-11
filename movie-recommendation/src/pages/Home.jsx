import "../css/Home.css";
import MovieCard from "../components/MovieCard";
import { getPopularMovies, searchMovies } from "../../services/api";
import { useState } from "react";
import { useEffect } from "react";
function Home() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadPopularMovies = async () => {
      try {
        const popularMovies = await getPopularMovies();
        setMovies(popularMovies);
      } catch (error) {
        setError("Failed to fetch popular movies.");
      } finally {
        setLoading(false);
      }
    };
    loadPopularMovies();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (loading) return;
    setLoading(true);
    try {
      const resultsResults = await searchMovies(searchQuery);
      setMovies(resultsResults);
      setError(null);
    } catch (error) {
      setError("Failed to search movies.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="home">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for movies..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
      {error ? <div className="error">{error}</div> : null}
      {loading ? <div className="loading">Loading...</div> : null}
      <div className="movies-grid">
        {movies.map(
          (movie) =>
            movie.title.toLowerCase().startsWith(searchQuery) && (
              <MovieCard movie={movie} key={movie.id} />
            )
        )}
      </div>
    </div>
  );
}
export default Home;
