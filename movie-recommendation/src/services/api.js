const API_KEY = "2e80ba1a5ef73dbcbdb38729b031907b";
const BASE_URL = "https://api.themoviedb.org/3";

export const getPopularMovies = async () => {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results;
};

export const searchMovies = async (query) => {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`,
  );
  const data = await response.json();
  return data.results;
};

/** Fetch multiple pages of popular movies for KNN candidate pool */
export const getLargeMoviePool = async (pages = 5) => {
  const fetches = Array.from({ length: pages }, (_, i) =>
    fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${i + 1}`).then(
      (r) => r.json(),
    ),
  );
  const results = await Promise.all(fetches);
  return results.flatMap((d) => d.results);
};

/** Fetch TMDB genre list */
export const getGenreList = async () => {
  const response = await fetch(
    `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`,
  );
  const data = await response.json();
  return data.genres;
};

/**
 * Search for a person (actor or director) — returns first TMDB result object
 */
export const searchPerson = async (name) => {
  if (!name?.trim()) return null;
  const response = await fetch(
    `${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(name.trim())}`,
  );
  const data = await response.json();
  if (!data.results?.length) return null;
  return data.results[0];
};

/**
 * Advanced discover/search
 * filters: { query, genreIds[], minRating, maxRating, yearFrom, yearTo, actorId, directorId, sortBy }
 */
export const advancedSearch = async (filters = {}) => {
  const {
    query,
    genreIds = [],
    minRating,
    maxRating,
    yearFrom,
    yearTo,
    actorId,
    directorId,
    sortBy = "popularity.desc",
  } = filters;

  // Pure keyword-only search → use /search/movie
  const hasFilters =
    genreIds.length ||
    minRating ||
    maxRating ||
    yearFrom ||
    yearTo ||
    actorId ||
    directorId;

  if (query?.trim() && !hasFilters) {
    return searchMovies(query);
  }

  const params = new URLSearchParams({ api_key: API_KEY, sort_by: sortBy });
  if (genreIds.length) params.set("with_genres", genreIds.join(","));
  if (minRating) params.set("vote_average.gte", minRating);
  if (maxRating) params.set("vote_average.lte", maxRating);
  if (yearFrom) params.set("primary_release_date.gte", `${yearFrom}-01-01`);
  if (yearTo) params.set("primary_release_date.lte", `${yearTo}-12-31`);
  if (actorId) params.set("with_cast", actorId);
  if (directorId) params.set("with_crew", directorId);

  const response = await fetch(`${BASE_URL}/discover/movie?${params}`);
  const data = await response.json();
  return data.results || [];
};
