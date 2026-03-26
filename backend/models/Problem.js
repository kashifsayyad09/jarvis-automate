const db = require('../config/database');

class Problem {
    // Create a new problem
    static async create(problemData) {
        const { title, description, solution, category, tags, userId } = problemData;
        const tagsString = Array.isArray(tags) ? tags.join(',') : tags;

        const [result] = await db.execute(
            'INSERT INTO problems (title, description, solution, category, tags, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, solution, category, tagsString, userId]
        );

        return result.insertId;
    }

    // Get all problems with pagination
    static async getAll(limit = 20, offset = 0) {
        const [rows] = await db.execute(
            `SELECT p.*, u.username, u.full_name,
             (SELECT COUNT(*) FROM comments WHERE problem_id = p.id) as comment_count,
             (SELECT COUNT(*) FROM problem_views WHERE problem_id = p.id) as view_count
             FROM problems p
             JOIN users u ON p.user_id = u.id
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows;
    }

    // Get problem by ID
    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT p.*, u.username, u.full_name,
             (SELECT COUNT(*) FROM comments WHERE problem_id = p.id) as comment_count,
             (SELECT COUNT(*) FROM problem_views WHERE problem_id = p.id) as view_count
             FROM problems p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Search problems
    static async search(searchTerm, category = null, limit = 20, offset = 0) {
        let query = `
            SELECT p.*, u.username, u.full_name,
            (SELECT COUNT(*) FROM comments WHERE problem_id = p.id) as comment_count,
            (SELECT COUNT(*) FROM problem_views WHERE problem_id = p.id) as view_count
            FROM problems p
            JOIN users u ON p.user_id = u.id
            WHERE (p.title LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)
        `;

        const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];

        if (category) {
            query += ' AND p.category = ?';
            params.push(category);
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await db.execute(query, params);
        return rows;
    }

    // Get problems by category
    static async getByCategory(category, limit = 20, offset = 0) {
        const [rows] = await db.execute(
            `SELECT p.*, u.username, u.full_name,
             (SELECT COUNT(*) FROM comments WHERE problem_id = p.id) as comment_count,
             (SELECT COUNT(*) FROM problem_views WHERE problem_id = p.id) as view_count
             FROM problems p
             JOIN users u ON p.user_id = u.id
             WHERE p.category = ?
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [category, limit, offset]
        );
        return rows;
    }

    // Get problems by user
    static async getByUser(userId, limit = 20, offset = 0) {
        const [rows] = await db.execute(
            `SELECT p.*,
             (SELECT COUNT(*) FROM comments WHERE problem_id = p.id) as comment_count,
             (SELECT COUNT(*) FROM problem_views WHERE problem_id = p.id) as view_count
             FROM problems p
             WHERE p.user_id = ?
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );
        return rows;
    }

    // Update problem
    static async update(id, problemData) {
        const { title, description, solution, category, tags } = problemData;
        const tagsString = Array.isArray(tags) ? tags.join(',') : tags;

        const [result] = await db.execute(
            'UPDATE problems SET title = ?, description = ?, solution = ?, category = ?, tags = ? WHERE id = ?',
            [title, description, solution, category, tagsString, id]
        );
        return result.affectedRows > 0;
    }

    // Delete problem
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM problems WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Increment view count
    static async incrementView(problemId, userId = null) {
        if (userId) {
            await db.execute(
                'INSERT INTO problem_views (problem_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE viewed_at = NOW()',
                [problemId, userId]
            );
        }
    }

    // Get trending problems (most viewed in last 7 days)
    static async getTrending(limit = 10) {
        const [rows] = await db.execute(
            `SELECT p.*, u.username, u.full_name,
             COUNT(DISTINCT pv.id) as view_count,
             (SELECT COUNT(*) FROM comments WHERE problem_id = p.id) as comment_count
             FROM problems p
             JOIN users u ON p.user_id = u.id
             LEFT JOIN problem_views pv ON p.id = pv.problem_id AND pv.viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY p.id
             ORDER BY view_count DESC, p.created_at DESC
             LIMIT ?`,
            [limit]
        );
        return rows;
    }
}

module.exports = Problem;
