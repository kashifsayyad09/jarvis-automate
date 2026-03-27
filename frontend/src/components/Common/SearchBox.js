import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { problemService } from '../../services/api';
import './SearchBox.css';

const SearchBox = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProblems = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await problemService.search(query);
        if (response.success) {
          setResults(response.data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProblems, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelectResult = (problemId) => {
    navigate(`/problem/${problemId}`);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="search-box" ref={searchRef}>
      <div className="search-input-container">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search problems..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        {query && (
          <button onClick={clearSearch} className="clear-btn" aria-label="Clear search">
            <FiX />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">Searching...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((problem) => (
                <li
                  key={problem.id}
                  onClick={() => handleSelectResult(problem.id)}
                  className="search-result-item"
                >
                  <div className="result-title">{problem.title}</div>
                  <div className="result-meta">
                    <span className="result-category">{problem.category_name}</span>
                    <span className="result-views">{problem.views} views</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results">No problems found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
