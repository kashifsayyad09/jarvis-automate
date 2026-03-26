const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Import routes
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/categories');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/signup.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/admin.html'));
});

app.get('/problem/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/problem-detail.html'));
});

app.get('/post-problem', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/post-problem.html'));
});

app.get('/category/:category', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/category.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║   Problem Solving Platform Server Started     ║
╚════════════════════════════════════════════════╝

🚀 Server running on: http://localhost:${PORT}
📊 Environment: ${process.env.NODE_ENV || 'development'}
💾 Database: AWS MySQL (${process.env.DB_HOST})

API Endpoints:
  - Auth:       /api/auth/*
  - Problems:   /api/problems/*
  - Admin:      /api/admin/*
  - Categories: /api/categories/*

Frontend Pages:
  - Home:       http://localhost:${PORT}/
  - Login:      http://localhost:${PORT}/login
  - Signup:     http://localhost:${PORT}/signup
  - Admin:      http://localhost:${PORT}/admin

Press Ctrl+C to stop the server
    `);
});

module.exports = app;
