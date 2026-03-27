-- Problem Solving Platform Schema (AWS MySQL Compatible)
-- Run this file on AWS RDS MySQL before starting the server.

CREATE DATABASE IF NOT EXISTS problem_solving_platform;
USE problem_solving_platform;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    icon VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    solution TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    tags TEXT DEFAULT NULL,
    status ENUM('open', 'resolved', 'archived') NOT NULL DEFAULT 'resolved',
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_problems_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_problems_user_id (user_id),
    INDEX idx_problems_category (category),
    INDEX idx_problems_created_at (created_at),
    FULLTEXT INDEX ft_problems_search (title, description, solution, tags)
);

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_problem FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_comments_problem_id (problem_id),
    INDEX idx_comments_user_id (user_id),
    INDEX idx_comments_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS problem_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT NOT NULL,
    user_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_problem_views_problem FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    CONSTRAINT fk_problem_views_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_problem_user_view (problem_id, user_id),
    INDEX idx_problem_views_problem_id (problem_id),
    INDEX idx_problem_views_viewed_at (viewed_at)
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action_type VARCHAR(80) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id INT DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_activity_logs_user_id (user_id),
    INDEX idx_activity_logs_action_type (action_type),
    INDEX idx_activity_logs_created_at (created_at)
);

INSERT INTO categories (slug, name, description, icon)
VALUES
('devops-issue', 'DevOps Issue', 'CI/CD, deployment, infra and automation related issues', '⚙️'),
('developer-issue', 'Developer Issue', 'Frontend, backend, APIs and code-level challenges', '💻'),
('cybersecurity-issue', 'Cybersecurity Issue', 'Security, auth, vulnerability and compliance problems', '🔐'),
('data-science-issue', 'Data Science Issue', 'ML, model training, data prep and feature engineering', '📊'),
('sap-issue', 'SAP Issue', 'SAP integration, module and process troubleshooting', '🏢'),
('data-analyst-issue', 'Data Analyst Issue', 'SQL, dashboards, reporting and BI issues', '📈'),
('system-administrator-issue', 'System Administrator Issue', 'Linux/Windows admin, networking and server maintenance', '🖥️')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), icon = VALUES(icon);
