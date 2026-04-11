import "../css/Favorites.css";
import { useMovieContext } from "../../contexts/MovieContext";
import MovieCard from "../components/MovieCard.jsx";
function Favorites() {
  const { favorites } = useMovieContext();
  if (favorites) {
    return (
      <div className="favorites">
        <h2>Your Favorites</h2>
        <div className="movies-grid">
          {favorites.map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="favorites-empty">
      <h2>Your Favorites List is Empty</h2>
      <p>Add movies to your favorites to see them here.</p>
    </div>
  );
}
export default Favorites;
