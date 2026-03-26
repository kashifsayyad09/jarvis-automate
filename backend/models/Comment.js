const db = require('../config/database');

class Comment {
    // Create a new comment
    static async create(commentData) {
        const { problemId, userId, content } = commentData;

        const [result] = await db.execute(
            'INSERT INTO comments (problem_id, user_id, content) VALUES (?, ?, ?)',
            [problemId, userId, content]
        );

        return result.insertId;
    }

    // Get comments for a problem
    static async getByProblem(problemId) {
        const [rows] = await db.execute(
            `SELECT c.*, u.username, u.full_name
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.problem_id = ?
             ORDER BY c.created_at ASC`,
            [problemId]
        );
        return rows;
    }

    // Delete comment
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM comments WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Update comment
    static async update(id, content) {
        const [result] = await db.execute(
            'UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?',
            [content, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Comment;
