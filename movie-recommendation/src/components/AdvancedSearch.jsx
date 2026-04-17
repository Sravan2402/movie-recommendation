import { useState, useEffect } from "react";
import { getGenreList, searchPerson } from "../services/api"; // FIX E3: was "../../services/api"
import "../css/AdvancedSearch.css";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "release_date.desc", label: "Newest First" },
  { value: "release_date.asc", label: "Oldest First" },
];

const CURRENT_YEAR = new Date().getFullYear();

/**
 * AdvancedSearch
 * Props:
 *   onSearch(filters) – called with resolved filter object
 *   loading – bool
 */
function AdvancedSearch({ onSearch, loading }) {
  const [open, setOpen] = useState(false);

  // Basic
  const [query, setQuery] = useState("");

  // Genres
  const [genres, setGenres] = useState([]); // [{id,name}] from TMDB
  const [selGenres, setSelGenres] = useState([]); // selected ids

  // Rating
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");

  // Year
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  // People
  const [actorInput, setActorInput] = useState("");
  const [directorInput, setDirectorInput] = useState("");
  const [actorResult, setActorResult] = useState(null);
  const [directorResult, setDirectorResult] = useState(null);
  const [actorError, setActorError] = useState("");
  const [directorError, setDirectorError] = useState("");

  // Sort
  const [sortBy, setSortBy] = useState("popularity.desc");

  // Load genre list once
  useEffect(() => {
    getGenreList()
      .then(setGenres)
      .catch(() => {});
  }, []);

  const toggleGenre = (id) => {
    setSelGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const resolveActor = async () => {
    setActorError("");
    if (!actorInput.trim()) {
      setActorResult(null);
      return;
    }
    const person = await searchPerson(actorInput);
    if (!person) {
      setActorError(`No actor found for "${actorInput}"`);
      setActorResult(null);
    } else setActorResult(person);
  };

  const resolveDirector = async () => {
    setDirectorError("");
    if (!directorInput.trim()) {
      setDirectorResult(null);
      return;
    }
    const person = await searchPerson(directorInput);
    if (!person) {
      setDirectorError(`No director found for "${directorInput}"`);
      setDirectorResult(null);
    } else setDirectorResult(person);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      query,
      genreIds: selGenres,
      minRating: minRating ? parseFloat(minRating) : undefined,
      maxRating: maxRating ? parseFloat(maxRating) : undefined,
      yearFrom: yearFrom ? parseInt(yearFrom, 10) : undefined,
      yearTo: yearTo ? parseInt(yearTo, 10) : undefined,
      actorId: actorResult?.id,
      directorId: directorResult?.id,
      sortBy,
    });
  };

  const handleReset = () => {
    setQuery("");
    setSelGenres([]);
    setMinRating("");
    setMaxRating("");
    setYearFrom("");
    setYearTo("");
    setActorInput("");
    setDirectorInput("");
    setActorResult(null);
    setDirectorResult(null);
    setSortBy("popularity.desc");
    onSearch({});
  };

  // FIX E12: prevent Enter in person inputs from submitting the form prematurely
  const preventEnterSubmit = (e) => {
    if (e.key === "Enter") e.preventDefault();
  };

  const activeFilterCount =
    (query ? 1 : 0) +
    selGenres.length +
    (minRating || maxRating ? 1 : 0) +
    (yearFrom || yearTo ? 1 : 0) +
    (actorResult ? 1 : 0) +
    (directorResult ? 1 : 0);

  return (
    <div className="adv-search">
      {/* ── Top bar ── */}
      <form className="adv-search__bar" onSubmit={handleSubmit}>
        <input
          type="text"
          className="adv-search__input"
          placeholder="Search movies by title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          type="button"
          className={`adv-search__filter-btn ${open ? "active" : ""}`}
          onClick={() => setOpen((o) => !o)}
        >
          ⚙ Filters
          {activeFilterCount > 0 && (
            <span className="adv-search__badge">{activeFilterCount}</span>
          )}
        </button>

        <button type="submit" className="adv-search__submit" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {/* ── Expanded filter panel ── */}
      {open && (
        <div className="adv-search__panel">
          {/* Genres */}
          <fieldset className="adv-field">
            <legend>Genre / Theme</legend>
            <div className="adv-genre-grid">
              {genres.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`genre-chip ${selGenres.includes(g.id) ? "selected" : ""}`}
                  onClick={() => toggleGenre(g.id)}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Rating */}
          <fieldset className="adv-field">
            <legend>Rating (0 – 10)</legend>
            <div className="adv-row">
              <label>
                Min
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  placeholder="0"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                />
              </label>
              <span className="adv-dash">–</span>
              <label>
                Max
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  placeholder="10"
                  value={maxRating}
                  onChange={(e) => setMaxRating(e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          {/* Year */}
          <fieldset className="adv-field">
            <legend>Release Year</legend>
            <div className="adv-row">
              <label>
                From
                <input
                  type="number"
                  min="1900"
                  max={CURRENT_YEAR}
                  placeholder="1900"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                />
              </label>
              <span className="adv-dash">–</span>
              <label>
                To
                <input
                  type="number"
                  min="1900"
                  max={CURRENT_YEAR + 2}
                  placeholder={CURRENT_YEAR}
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          {/* Actor */}
          <fieldset className="adv-field">
            <legend>Actor / Hero / Heroine</legend>
            <div className="adv-person-row">
              <input
                type="text"
                placeholder="e.g. Tom Hanks, Deepika Padukone…"
                value={actorInput}
                onChange={(e) => {
                  setActorInput(e.target.value);
                  setActorResult(null);
                }}
                onBlur={resolveActor}
                onKeyDown={preventEnterSubmit} // FIX E12
              />
              <button
                type="button"
                className="adv-resolve-btn"
                onClick={resolveActor}
              >
                Find
              </button>
            </div>
            {actorResult && (
              <p className="adv-resolved">✓ {actorResult.name}</p>
            )}
            {actorError && <p className="adv-error">{actorError}</p>}
          </fieldset>

          {/* Director */}
          <fieldset className="adv-field">
            <legend>Director</legend>
            <div className="adv-person-row">
              <input
                type="text"
                placeholder="e.g. Christopher Nolan, S.S. Rajamouli…"
                value={directorInput}
                onChange={(e) => {
                  setDirectorInput(e.target.value);
                  setDirectorResult(null);
                }}
                onBlur={resolveDirector}
                onKeyDown={preventEnterSubmit} // FIX E12
              />
              <button
                type="button"
                className="adv-resolve-btn"
                onClick={resolveDirector}
              >
                Find
              </button>
            </div>
            {directorResult && (
              <p className="adv-resolved">✓ {directorResult.name}</p>
            )}
            {directorError && <p className="adv-error">{directorError}</p>}
          </fieldset>

          {/* Sort */}
          <fieldset className="adv-field">
            <legend>Sort By</legend>
            <div className="adv-sort-row">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`sort-chip ${sortBy === opt.value ? "selected" : ""}`}
                  onClick={() => setSortBy(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Actions */}
          <div className="adv-actions">
            <button type="button" className="adv-reset" onClick={handleReset}>
              Reset All
            </button>
            <button
              type="button"
              className="adv-apply"
              onClick={handleSubmit}
              disabled={loading}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedSearch;
