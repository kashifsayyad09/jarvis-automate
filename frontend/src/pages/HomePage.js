import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiClock, FiArrowRight } from 'react-icons/fi';
import { categoryService, problemService } from '../services/api';
import './HomePage.css';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProblems, setFeaturedProblems] = useState([]);
  const [recentProblems, setRecentProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, problemsRes] = await Promise.all([
        categoryService.getAll(),
        problemService.getAll({ limit: 10 })
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }

      if (problemsRes.success) {
        const problems = problemsRes.data;
        setFeaturedProblems(problems.filter(p => p.is_featured).slice(0, 3));
        setRecentProblems(problems.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <h1>Share & Solve Technical Problems</h1>
          <p>A community-driven platform where developers share problems and solutions</p>
          <Link to="/post-problem" className="btn btn-primary">
            Share Your Solution
          </Link>
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <h2>Browse by Category</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="category-card"
              >
                <div className="category-icon">{category.icon || '📁'}</div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span className="category-link">
                  View Problems <FiArrowRight />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featuredProblems.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <h2>
              <FiTrendingUp /> Featured Solutions
            </h2>
            <div className="problems-grid">
              {featuredProblems.map((problem) => (
                <Link
                  key={problem.id}
                  to={`/problem/${problem.id}`}
                  className="problem-card featured"
                >
                  <span className="featured-badge">Featured</span>
                  <h3>{problem.title}</h3>
                  <p className="problem-excerpt">
                    {problem.description.substring(0, 150)}...
                  </p>
                  <div className="problem-meta">
                    <span className="category-badge">{problem.category_name}</span>
                    <span className="stats">
                      👁️ {problem.views} • 👍 {problem.upvotes}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="recent-section">
        <div className="container">
          <h2>
            <FiClock /> Recent Problems
          </h2>
          <div className="problems-list">
            {recentProblems.map((problem) => (
              <Link
                key={problem.id}
                to={`/problem/${problem.id}`}
                className="problem-item"
              >
                <div className="problem-item-content">
                  <h3>{problem.title}</h3>
                  <p>{problem.description.substring(0, 200)}...</p>
                  <div className="problem-tags">
                    {problem.tags?.split(',').slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="tag">{tag.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="problem-item-meta">
                  <span className="category-badge">{problem.category_name}</span>
                  <div className="stats">
                    <span>👁️ {problem.views}</span>
                    <span>👍 {problem.upvotes}</span>
                  </div>
                  <div className="author">By {problem.username}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
