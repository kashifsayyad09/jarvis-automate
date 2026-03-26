const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
    let connection;

    try {
        // First, connect without database to create it if needed
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('Connected to AWS MySQL server');

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`Database '${process.env.DB_NAME}' created or already exists`);

        // Use the database
        await connection.query(`USE ${process.env.DB_NAME}`);

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_username (username)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Users table created');

        // Create problems table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS problems (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                solution TEXT NOT NULL,
                category VARCHAR(50) NOT NULL,
                tags VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_category (category),
                INDEX idx_user_id (user_id),
                INDEX idx_created_at (created_at),
                FULLTEXT idx_search (title, description, tags)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Problems table created');

        // Create comments table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                problem_id INT NOT NULL,
                user_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_problem_id (problem_id),
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Comments table created');

        // Create problem_views table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS problem_views (
                id INT PRIMARY KEY AUTO_INCREMENT,
                problem_id INT NOT NULL,
                user_id INT,
                viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_problem_id (problem_id),
                INDEX idx_viewed_at (viewed_at),
                UNIQUE KEY unique_user_problem (problem_id, user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Problem views table created');

        // Check if admin user exists
        const [adminExists] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [process.env.ADMIN_EMAIL || 'admin@platform.com']
        );

        if (adminExists.length === 0) {
            // Create admin user
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
            await connection.query(
                `INSERT INTO users (username, email, password, full_name, role)
                 VALUES (?, ?, ?, ?, ?)`,
                ['admin', process.env.ADMIN_EMAIL || 'admin@platform.com', hashedPassword, 'Administrator', 'admin']
            );
            console.log('Admin user created');
            console.log(`Email: ${process.env.ADMIN_EMAIL || 'admin@platform.com'}`);
            console.log(`Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
        } else {
            console.log('Admin user already exists');
        }

        console.log('\n✅ Database initialization completed successfully!');
        console.log('\nYou can now start the server with: npm start');

    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run initialization
initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
