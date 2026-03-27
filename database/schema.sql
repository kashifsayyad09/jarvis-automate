-- Problem Solving Platform Database Schema

-- Drop tables if exist (for fresh install)
DROP TABLE IF EXISTS problem_solutions;
DROP TABLE IF EXISTS problems;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('user', 'admin') DEFAULT 'user',
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- Problems table
CREATE TABLE problems (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    solution TEXT NOT NULL,
    tags VARCHAR(255),
    views INT DEFAULT 0,
    upvotes INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    FULLTEXT INDEX idx_search (title, description, solution, tags)
);

-- Problem Solutions (additional solutions from other users)
CREATE TABLE problem_solutions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    problem_id INT NOT NULL,
    user_id INT NOT NULL,
    solution TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_problem (problem_id),
    INDEX idx_user (user_id)
);

-- Insert default categories
INSERT INTO categories (name, slug, description, icon) VALUES
('DevOps Issue', 'devops', 'CI/CD, Docker, Kubernetes, Infrastructure issues', 'settings'),
('Developer Issue', 'developer', 'Programming, coding, and software development issues', 'code'),
('Cybersecurity Issue', 'cybersecurity', 'Security vulnerabilities, threats, and protection', 'shield'),
('Data Science Issue', 'data-science', 'ML, AI, data analysis, and statistical problems', 'analytics'),
('SAP Issue', 'sap', 'SAP systems, modules, and configuration issues', 'business'),
('Data Analyst Issue', 'data-analyst', 'Data visualization, reporting, and analysis', 'chart'),
('System Administrator Issue', 'sysadmin', 'Server management, networking, and system issues', 'server'),
('Cloud Computing Issue', 'cloud', 'AWS, Azure, GCP, and cloud infrastructure', 'cloud'),
('Database Issue', 'database', 'SQL, NoSQL, database design and optimization', 'storage'),
('Frontend Issue', 'frontend', 'UI/UX, React, Angular, Vue.js issues', 'palette');

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@problemsolve.com', '$2b$10$XqZ8J5tJYhN4gYWVXqZQJOKZ5wZj5X2J5tJYhN4gYWVXqZQJOKZ5w', 'System Administrator', 'admin');
