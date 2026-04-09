import React from "react";
import "./App.css";
import { useState, useEffect } from "react";
import { Link, Routes, Route, useParams, useNavigate } from "react-router-dom";

const APP_KEY = "3d9e493e";

const App = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      if (!searchTerm.trim()) {
        setMovies([]);
        setError("");
        return;
      }

      setLoading(true);
      setError("");
      setMovies([]);

      try {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${APP_KEY}&s=${searchTerm}`,
        );
        const data = await response.json();

        if (data.Response === "True") {
          setMovies(data.Search);
        } else {
          setError(data.Error || "No movies found");
        }
      } catch (err) {
        setError("Failed to fetch movies. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchInput.trim()) {
      setError("Please enter a movie name");
      return;
    }

    setSearchTerm(searchInput);
  };

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Movie Review Hub</h1>
        <p>Search and discover movie reviews</p>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <Home
              searchInput={searchInput}
              handleInputChange={handleInputChange}
              handleSearch={handleSearch}
              movies={movies}
              loading={loading}
              error={error}
            />
          }
        />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </div>
  );
};

const Home = ({
  searchInput,
  handleInputChange,
  handleSearch,
  movies,
  loading,
  error,
}) => {
  const centerClass = movies.length > 0 && movies.length <= 2 ? "center-results" : "";

  return (
    <>
      <form onSubmit={handleSearch} className="search-container">
        <input
          type="text"
          placeholder="Enter movie name..."
          value={searchInput}
          onChange={handleInputChange}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Loading movies...</div>}

      <div className={`movies-container ${centerClass}`}>
        {movies.length > 0 ? (
          movies.map((movie) => <MovieCard key={movie.imdbID} movie={movie} />)
        ) : (
          !loading && <p className="no-results">Search for a movie to get started</p>
        )}
      </div>
    </>
  );
};

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card">
      <img src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/200x300?text=No+Image"}  alt={movie.Title}  className="movie-poster" />
      <div className="movie-info">
        <h3>{movie.Title}</h3>
        <p className="year">{movie.Year}</p>
        <p className="type">{movie.Type}</p>
        <Link to={`/movie/${movie.imdbID}`} className="details-button">
          View Details
        </Link>
      </div>
    </div>
  );
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${APP_KEY}&i=${id}`,
        );
        const data = await response.json();

        if (data.Response === "True") {
          setMovieDetails(data);
        } else {
          setError(data.Error || "Movie details not found");
        }
      } catch (err) {
        setError("Failed to fetch movie details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  return (
    <div className="details-page">
      <button type="button" className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {loading && <div className="loading">Loading movie details...</div>}
      {error && <div className="error-message">{error}</div>}

      {movieDetails && (
        <div className="movie-detail-card">
          <div className="movie-card-detail-header">
            <img
              src={
                movieDetails.Poster !== "N/A"
                  ? movieDetails.Poster
                  : "https://via.placeholder.com/300x450?text=No+Image"
              }
              alt={movieDetails.Title}
              className="movie-detail-poster"
            />
            <div className="movie-detail-info">
              <h2>{movieDetails.Title}</h2>
              <p className="year">{movieDetails.Year}</p>
              <p className="type">{movieDetails.Genre}</p>
              <p>{movieDetails.Plot}</p>
              <p>
                <strong>Director:</strong> {movieDetails.Director}
              </p>
              <p>
                <strong>Cast:</strong> {movieDetails.Actors}
              </p>
              <p>
                <strong>IMDb Rating:</strong> ⭐ {movieDetails.imdbRating}/10
              </p>
            </div>
          </div>

          {movieDetails.Ratings && movieDetails.Ratings.length > 0 && (
            <div className="ratings">
              <strong>Reviews:</strong>
              {movieDetails.Ratings.map((rating, index) => (
                <p key={index}>
                  {rating.Source}: {rating.Value}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;


