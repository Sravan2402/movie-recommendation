import "../css/Favorites.css";
import { useMovieContext } from "../../contexts/MovieContext";
import { useRecommendations } from "../../contexts/RecommendationContext";
import MovieCard from "../components/MovieCard.jsx";

function Favorites() {
  const { favorites } = useMovieContext();
  const { recommendations, poolLoading } = useRecommendations();

  if (!favorites || favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <h2>Your Favorites List is Empty</h2>
        <p>Add movies to your favorites to see them here.</p>
      </div>
    );
  }

  return (
    <div className="favorites">
      {/* Favorited movies */}
      <h2>Your Favorites</h2>
      <div className="movies-grid">
        {favorites.map((movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
      </div>

      {/* KNN-based "Because you liked your favorites" section */}
      <section className="favorites-recs">
        <div className="favorites-recs-header">
          <h3>
            <span className="knn-badge">KNN</span>
            Because You Like These Movies
          </h3>
          <p>Recommendations based on your taste profile</p>
        </div>

        {poolLoading ? (
          <div className="loading">Building recommendation model…</div>
        ) : recommendations.length > 0 ? (
          <div className="movies-grid">
            {recommendations.map((movie) => (
              <MovieCard movie={movie} key={`fav-rec-${movie.id}`} />
            ))}
          </div>
        ) : (
          <p className="no-recs">
            No recommendations found yet — try adding more favorites!
          </p>
        )}
      </section>
    </div>
  );
}

export default Favorites;
