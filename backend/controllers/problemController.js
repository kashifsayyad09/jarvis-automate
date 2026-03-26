const Problem = require('../models/Problem');
const Comment = require('../models/Comment');

// Create a new problem
exports.createProblem = async (req, res) => {
    try {
        const { title, description, solution, category, tags } = req.body;
        const userId = req.user.id;

        const problemId = await Problem.create({
            title,
            description,
            solution,
            category,
            tags,
            userId
        });

        res.status(201).json({
            success: true,
            message: 'Problem posted successfully',
            problemId
        });
    } catch (error) {
        console.error('Create problem error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating problem'
        });
    }
};

// Get all problems
exports.getAllProblems = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const problems = await Problem.getAll(limit, offset);

        res.json({
            success: true,
            count: problems.length,
            page,
            problems
        });
    } catch (error) {
        console.error('Get all problems error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching problems'
        });
    }
};

// Get single problem
exports.getProblem = async (req, res) => {
    try {
        const { id } = req.params;

        const problem = await Problem.findById(id);

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Increment view count
        const userId = req.user ? req.user.id : null;
        await Problem.incrementView(id, userId);

        // Get comments
        const comments = await Comment.getByProblem(id);

        res.json({
            success: true,
            problem,
            comments
        });
    } catch (error) {
        console.error('Get problem error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching problem'
        });
    }
};

// Search problems
exports.searchProblems = async (req, res) => {
    try {
        const { q, category } = req.query;
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const problems = await Problem.search(q, category, limit, offset);

        res.json({
            success: true,
            count: problems.length,
            page,
            query: q,
            category: category || 'all',
            problems
        });
    } catch (error) {
        console.error('Search problems error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching problems'
        });
    }
};

// Get problems by category
exports.getProblemsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const problems = await Problem.getByCategory(category, limit, offset);

        res.json({
            success: true,
            count: problems.length,
            page,
            category,
            problems
        });
    } catch (error) {
        console.error('Get problems by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching problems'
        });
    }
};

// Get trending problems
exports.getTrendingProblems = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const problems = await Problem.getTrending(limit);

        res.json({
            success: true,
            count: problems.length,
            problems
        });
    } catch (error) {
        console.error('Get trending problems error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching trending problems'
        });
    }
};

// Update problem
exports.updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, solution, category, tags } = req.body;

        const problem = await Problem.findById(id);

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Check if user owns the problem or is admin
        if (problem.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this problem'
            });
        }

        await Problem.update(id, { title, description, solution, category, tags });

        res.json({
            success: true,
            message: 'Problem updated successfully'
        });
    } catch (error) {
        console.error('Update problem error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating problem'
        });
    }
};

// Delete problem
exports.deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;

        const problem = await Problem.findById(id);

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Check if user owns the problem or is admin
        if (problem.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this problem'
            });
        }

        await Problem.delete(id);

        res.json({
            success: true,
            message: 'Problem deleted successfully'
        });
    } catch (error) {
        console.error('Delete problem error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting problem'
        });
    }
};

// Add comment to problem
exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        const commentId = await Comment.create({
            problemId: id,
            userId,
            content
        });

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            commentId
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding comment'
        });
    }
};
