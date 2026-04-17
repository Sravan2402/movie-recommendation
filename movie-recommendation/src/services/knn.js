/**
 * KNN Movie Recommendation Engine
 *
 * Features used per movie:
 *  - genre_ids (multi-hot encoded over known TMDB genre IDs)
 *  - vote_average  (normalized 0-1)
 *  - popularity    (log-normalized 0-1)
 *  - release_year  (normalized 0-1 over 1900-2030)
 */

// All TMDB genre IDs we encode
const GENRE_IDS = [
  28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 10770,
  53, 10752, 37,
];

const GENRE_COUNT = GENRE_IDS.length;
const FEATURE_DIM = GENRE_COUNT + 3; // genres + vote_avg + popularity + year

/** Build a normalized feature vector for a movie */
export function buildVector(movie) {
  const vec = new Float32Array(FEATURE_DIM);

  // Multi-hot genre encoding
  const genreSet = new Set(movie.genre_ids || []);
  GENRE_IDS.forEach((id, i) => {
    vec[i] = genreSet.has(id) ? 1 : 0;
  });

  // Vote average: 0-10 → 0-1
  vec[GENRE_COUNT] = (movie.vote_average || 0) / 10;

  // Popularity: log-scale normalize (most movies < 1000)
  vec[GENRE_COUNT + 1] = Math.min(Math.log1p(movie.popularity || 0) / 10, 1);

  // Release year
  const year = movie.release_date
    ? parseInt(movie.release_date.slice(0, 4), 10)
    : 2000;
  vec[GENRE_COUNT + 2] = Math.max(0, Math.min((year - 1900) / 130, 1));

  return vec;
}

/** Cosine similarity between two Float32Arrays */
function cosineSim(a, b) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Given a query vector (averaged from favorites) and a candidate pool,
 * return the top-k most similar movies (excluding already-favorited ids).
 *
 * @param {Float32Array} queryVec
 * @param {Array} candidates  - array of movie objects with pre-built `_vec`
 * @param {Set<number>} excludeIds
 * @param {number} k
 */
export function knnQuery(queryVec, candidates, excludeIds, k = 10) {
  const scored = candidates
    .filter((m) => !excludeIds.has(m.id))
    .map((m) => ({
      movie: m,
      score: cosineSim(queryVec, m._vec),
    }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((s) => s.movie);
}

/**
 * Build a "profile" vector by averaging the vectors of favorite movies.
 * @param {Array} favorites  - movie objects (already have `_vec`)
 */
export function buildProfileVector(favorites) {
  if (!favorites.length) return null;
  const avg = new Float32Array(FEATURE_DIM);
  for (const fav of favorites) {
    const v = fav._vec || buildVector(fav);
    for (let i = 0; i < FEATURE_DIM; i++) avg[i] += v[i];
  }
  for (let i = 0; i < FEATURE_DIM; i++) avg[i] /= favorites.length;
  return avg;
}

/**
 * Attach `_vec` to every movie in-place (mutates).
 */
export function attachVectors(movies) {
  for (const m of movies) {
    if (!m._vec) m._vec = buildVector(m);
  }
  return movies;
}

/**
 * Get recommendations for a single "seed" movie from a candidate pool.
 */
export function similarMovies(seedMovie, candidates, k = 6) {
  const seedVec = seedMovie._vec || buildVector(seedMovie);
  return knnQuery(seedVec, candidates, new Set([seedMovie.id]), k);
}
