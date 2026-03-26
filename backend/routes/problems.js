const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const { authenticate } = require('../middleware/auth');
const { problemValidation, validate } = require('../middleware/validation');

// Public routes
router.get('/', problemController.getAllProblems);
router.get('/search', problemController.searchProblems);
router.get('/trending', problemController.getTrendingProblems);
router.get('/category/:category', problemController.getProblemsByCategory);
router.get('/:id', problemController.getProblem);

// Protected routes
router.post('/', authenticate, problemValidation, validate, problemController.createProblem);
router.put('/:id', authenticate, problemController.updateProblem);
router.delete('/:id', authenticate, problemController.deleteProblem);
router.post('/:id/comments', authenticate, problemController.addComment);

module.exports = router;
