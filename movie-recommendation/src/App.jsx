import "./css/App.css";
import { MovieProvider } from "../contexts/MovieContext";
import { RecommendationProvider } from "../contexts/RecommendationContext";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";

function App() {
  return (
    <MovieProvider>
      {/* RecommendationProvider is nested inside MovieProvider so it can
          access favorites via useMovieContext */}
      <RecommendationProvider>
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
      </RecommendationProvider>
    </MovieProvider>
  );
}

export default App;
