const User = require('../models/User');
const Problem = require('../models/Problem');
const db = require('../config/database');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const [usersCount] = await db.execute('SELECT COUNT(*) as count FROM users');
        const [problemsCount] = await db.execute('SELECT COUNT(*) as count FROM problems');
        const [commentsCount] = await db.execute('SELECT COUNT(*) as count FROM comments');
        const [viewsCount] = await db.execute('SELECT COUNT(*) as count FROM problem_views');

        // Get recent activities
        const [recentProblems] = await db.execute(
            `SELECT p.*, u.username FROM problems p
             JOIN users u ON p.user_id = u.id
             ORDER BY p.created_at DESC LIMIT 5`
        );

        const [recentUsers] = await db.execute(
            'SELECT id, username, email, full_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
        );

        res.json({
            success: true,
            stats: {
                totalUsers: usersCount[0].count,
                totalProblems: problemsCount[0].count,
                totalComments: commentsCount[0].count,
                totalViews: viewsCount[0].count
            },
            recentProblems,
            recentUsers
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard stats'
        });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const users = await User.getAll(limit, offset);

        res.json({
            success: true,
            count: users.length,
            page,
            users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
};

// Update user role
exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be "user" or "admin"'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.updateRole(userId, role);

        res.json({
            success: true,
            message: 'User role updated successfully'
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating user role'
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent admin from deleting themselves
        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.delete(userId);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting user'
        });
    }
};

// Delete any problem (admin)
exports.deleteProblem = async (req, res) => {
    try {
        const { problemId } = req.params;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        await Problem.delete(problemId);

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

// Get category statistics
exports.getCategoryStats = async (req, res) => {
    try {
        const [stats] = await db.execute(
            `SELECT category, COUNT(*) as count
             FROM problems
             GROUP BY category
             ORDER BY count DESC`
        );

        res.json({
            success: true,
            categoryStats: stats
        });
    } catch (error) {
        console.error('Get category stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching category stats'
        });
    }
};
