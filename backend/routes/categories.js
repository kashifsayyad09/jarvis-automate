const express = require('express');
const router = express.Router();
const CATEGORIES = require('../config/categories');

// Get all categories
router.get('/', (req, res) => {
    res.json({
        success: true,
        categories: CATEGORIES
    });
});

module.exports = router;
