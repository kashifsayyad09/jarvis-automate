const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Create a new user
    static async create(userData) {
        const { username, email, password, fullName, role = 'user' } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, fullName, role]
        );

        return result.insertId;
    }

    // Find user by email
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    // Find user by ID
    static async findById(id) {
        const [rows] = await db.execute('SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    // Find user by username
    static async findByUsername(username) {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Get all users (admin only)
    static async getAll(limit = 50, offset = 0) {
        const [rows] = await db.execute(
            'SELECT id, username, email, full_name, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        return rows;
    }

    // Update user role (admin only)
    static async updateRole(userId, role) {
        const [result] = await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
        return result.affectedRows > 0;
    }

    // Delete user (admin only)
    static async delete(userId) {
        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [userId]);
        return result.affectedRows > 0;
    }

    // Get user statistics
    static async getStats(userId) {
        const [problemsCount] = await db.execute(
            'SELECT COUNT(*) as count FROM problems WHERE user_id = ?',
            [userId]
        );

        const [commentsCount] = await db.execute(
            'SELECT COUNT(*) as count FROM comments WHERE user_id = ?',
            [userId]
        );

        return {
            problemsPosted: problemsCount[0].count,
            commentsPosted: commentsCount[0].count
        };
    }
}

module.exports = User;
