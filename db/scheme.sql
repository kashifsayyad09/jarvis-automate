-- ============================================
-- Problem Solving Platform Database Schema
-- Optimized for AWS RDS MySQL
-- ============================================
-- MySQL Database Schema for a platform that allows users to share and solve technical issues
--
-- Features:
-- - User authentication and authorization (user/admin roles)
-- - Problem posting and management with categorization
-- - Comments and discussions
-- - View tracking and trending problems
-- - Full-text search capabilities
-- - Optimized indexes for performance
--
-- Compatible with: MySQL 8.0+ / MariaDB 10.5+
-- Character Set: UTF8MB4 (full Unicode support including emojis)
-- Collation: utf8mb4_unicode_ci (case-insensitive, accent-insensitive)
-- Storage Engine: InnoDB (ACID compliant, supports foreign keys)
-- ============================================

-- Note: Database creation should be handled separately
-- For RDS, create the database via AWS Console or CLI
-- CREATE DATABASE IF NOT EXISTS problem_solving_platform
--   DEFAULT CHARACTER SET utf8mb4
--   DEFAULT COLLATE utf8mb4_unicode_ci;
-- USE problem_solving_platform;

-- ============================================
-- Users Table
-- Stores user authentication and profile information
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
    full_name VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,

    -- Indexes for performance optimization
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='User accounts with authentication credentials';

-- ============================================
-- Problems Table
-- Stores technical problems/issues posted by users
-- ============================================
CREATE TABLE IF NOT EXISTS problems (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    solution TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    tags VARCHAR(255) DEFAULT NULL COMMENT 'Comma-separated tags',
    status ENUM('open', 'solved', 'closed') DEFAULT 'open' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,

    -- Foreign key constraints
    CONSTRAINT fk_problems_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Indexes for performance optimization
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_category_status (category, status),
    INDEX idx_user_created (user_id, created_at DESC),

    -- Full-text search index for content search
    FULLTEXT INDEX idx_fulltext_search (title, description, tags)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Technical problems and solutions shared by users';

-- ============================================
-- Comments Table
-- Stores user comments/discussions on problems
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    problem_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,

    -- Foreign key constraints
    CONSTRAINT fk_comments_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Indexes for performance optimization
    INDEX idx_problem_id (problem_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_problem_created (problem_id, created_at ASC)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='User comments and discussions on problems';

-- ============================================
-- Problem Views Table
-- Tracks which users have viewed which problems
-- Enables trending problems and analytics
-- ============================================
CREATE TABLE IF NOT EXISTS problem_views (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    problem_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED DEFAULT NULL COMMENT 'NULL for anonymous views',
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IPv4 or IPv6 address',
    user_agent VARCHAR(255) DEFAULT NULL COMMENT 'Browser user agent',
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Foreign key constraints
    CONSTRAINT fk_views_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_views_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    -- Indexes for performance optimization
    INDEX idx_problem_id (problem_id),
    INDEX idx_user_id (user_id),
    INDEX idx_viewed_at (viewed_at),
    INDEX idx_problem_viewed (problem_id, viewed_at DESC),

    -- Unique constraint to prevent duplicate views from same user
    UNIQUE KEY unique_user_problem (problem_id, user_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Tracks problem views for analytics and trending';

-- ============================================
-- Problem Votes Table (Optional Enhancement)
-- Allows users to upvote/downvote problems
-- ============================================
CREATE TABLE IF NOT EXISTS problem_votes (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    problem_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    vote_type ENUM('upvote', 'downvote') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,

    -- Foreign key constraints
    CONSTRAINT fk_votes_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_votes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Indexes for performance optimization
    INDEX idx_problem_id (problem_id),
    INDEX idx_user_id (user_id),

    -- Unique constraint: one vote per user per problem
    UNIQUE KEY unique_user_problem_vote (problem_id, user_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='User votes (upvote/downvote) on problems';

-- ============================================
-- Tags Table (Optional Enhancement)
-- Normalized tag storage for better performance
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT DEFAULT NULL,
    usage_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Indexes
    INDEX idx_slug (slug),
    INDEX idx_usage_count (usage_count DESC)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Tag definitions for categorizing problems';

-- ============================================
-- Problem Tags Junction Table (Optional Enhancement)
-- Many-to-many relationship between problems and tags
-- ============================================
CREATE TABLE IF NOT EXISTS problem_tags (
    problem_id INT UNSIGNED NOT NULL,
    tag_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Composite primary key
    PRIMARY KEY (problem_id, tag_id),

    -- Foreign key constraints
    CONSTRAINT fk_problem_tags_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_problem_tags_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Indexes
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Links problems to tags (many-to-many)';

-- ============================================
-- Sessions Table (Optional - for session storage)
-- Can be used with express-mysql-session
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    expires INT UNSIGNED NOT NULL,
    data MEDIUMTEXT,

    INDEX idx_expires (expires)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Express session storage';

-- ============================================
-- Audit Log Table (Optional Enhancement)
-- Tracks important user actions for security
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNSIGNED DEFAULT NULL,
    action VARCHAR(100) NOT NULL COMMENT 'e.g., login, logout, create_problem, delete_comment',
    entity_type VARCHAR(50) DEFAULT NULL COMMENT 'e.g., problem, comment, user',
    entity_id INT UNSIGNED DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(255) DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Foreign key (soft reference, no constraint to allow deleted users)
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Audit trail for security and compliance';

-- ============================================
-- Performance Optimization Views
-- ============================================

-- View: Problem statistics with aggregated counts
CREATE OR REPLACE VIEW problem_stats AS
SELECT
    p.id,
    p.title,
    p.category,
    p.status,
    p.user_id,
    u.username,
    p.created_at,
    COUNT(DISTINCT c.id) AS comment_count,
    COUNT(DISTINCT pv.id) AS view_count,
    COALESCE(SUM(CASE WHEN pvt.vote_type = 'upvote' THEN 1 ELSE 0 END), 0) AS upvotes,
    COALESCE(SUM(CASE WHEN pvt.vote_type = 'downvote' THEN 1 ELSE 0 END), 0) AS downvotes
FROM problems p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN comments c ON p.id = c.problem_id
LEFT JOIN problem_views pv ON p.id = pv.problem_id
LEFT JOIN problem_votes pvt ON p.id = pvt.problem_id
GROUP BY p.id, p.title, p.category, p.status, p.user_id, u.username, p.created_at;

-- ============================================
-- Useful Stored Procedures
-- ============================================

-- Procedure: Get trending problems in the last N days
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS get_trending_problems(
    IN days INT,
    IN limit_count INT
)
BEGIN
    SELECT
        p.id,
        p.title,
        p.category,
        p.status,
        u.username,
        u.full_name,
        COUNT(DISTINCT pv.id) AS view_count,
        COUNT(DISTINCT c.id) AS comment_count,
        p.created_at
    FROM problems p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN problem_views pv ON p.id = pv.problem_id
        AND pv.viewed_at >= DATE_SUB(NOW(), INTERVAL days DAY)
    LEFT JOIN comments c ON p.id = c.problem_id
    GROUP BY p.id, p.title, p.category, p.status, u.username, u.full_name, p.created_at
    ORDER BY view_count DESC, comment_count DESC, p.created_at DESC
    LIMIT limit_count;
END //
DELIMITER ;

-- Procedure: Get user statistics
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS get_user_stats(
    IN user_id_param INT
)
BEGIN
    SELECT
        u.id,
        u.username,
        u.full_name,
        u.email,
        u.role,
        u.created_at,
        COUNT(DISTINCT p.id) AS problems_posted,
        COUNT(DISTINCT c.id) AS comments_posted,
        COALESCE(SUM(CASE WHEN pv.vote_type = 'upvote' THEN 1 ELSE 0 END), 0) AS total_upvotes_received
    FROM users u
    LEFT JOIN problems p ON u.id = p.user_id
    LEFT JOIN comments c ON u.id = c.user_id
    LEFT JOIN problem_votes pv ON p.id = pv.problem_id
    WHERE u.id = user_id_param
    GROUP BY u.id, u.username, u.full_name, u.email, u.role, u.created_at;
END //
DELIMITER ;

-- ============================================
-- Sample Data Insertion (Optional)
-- ============================================
-- Note: Admin user should be created via application or init script
-- Password should be hashed with bcrypt before insertion
--
-- Example admin user (password: Admin@123):
-- INSERT INTO users (username, email, password, full_name, role)
-- VALUES ('admin', 'admin@platform.com', '$2a$10$YourBcryptHashedPasswordHere', 'Administrator', 'admin');
--
-- Sample categories available:
-- - web-development
-- - mobile-development
-- - database
-- - devops
-- - security
-- - algorithms
-- - networking
-- - cloud
-- - other

-- ============================================
-- Maintenance Queries (Run Periodically)
-- ============================================

-- Clean up old anonymous views (older than 90 days)
-- DELETE FROM problem_views WHERE user_id IS NULL AND viewed_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Update tag usage counts
-- UPDATE tags t SET usage_count = (
--     SELECT COUNT(*) FROM problem_tags pt WHERE pt.tag_id = t.id
-- );

-- ============================================
-- RDS Specific Optimizations
-- ============================================

-- For AWS RDS MySQL, consider these parameter group settings:
-- - innodb_buffer_pool_size: Set to 75% of available RAM
-- - max_connections: Adjust based on expected concurrent users
-- - innodb_log_file_size: Increase for better write performance
-- - query_cache_type: OFF (deprecated in MySQL 8.0)
-- - slow_query_log: ON (for monitoring)
-- - long_query_time: 2 (log queries taking > 2 seconds)

-- Enable Performance Schema for monitoring:
-- SET GLOBAL performance_schema = ON;

-- Monitor table statistics:
-- ANALYZE TABLE users, problems, comments, problem_views;

-- ============================================
-- Backup and Restore Notes
-- ============================================

-- RDS Automated Backups:
-- - Enable automated backups in RDS settings
-- - Set backup retention period (1-35 days)
-- - Define backup window during low-traffic hours
-- - Enable point-in-time recovery

-- Manual Backup:
-- mysqldump -h your-rds-endpoint.rds.amazonaws.com -u admin -p problem_solving_platform > backup.sql

-- Restore:
-- mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p problem_solving_platform < backup.sql

-- ============================================
-- Security Best Practices
-- ============================================

-- 1. Use parameter groups to enforce SSL connections
-- 2. Enable encryption at rest in RDS settings
-- 3. Use IAM database authentication when possible
-- 4. Restrict security group access to application servers only
-- 5. Regularly rotate database passwords
-- 6. Enable audit logging via RDS parameter groups
-- 7. Use read replicas for scaling read operations
-- 8. Enable Multi-AZ for high availability

-- ============================================
-- End of Schema Definition
-- ============================================
