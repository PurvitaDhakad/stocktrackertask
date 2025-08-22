CREATE DATABASE stocktracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stocktracker;


CREATE TABLE users (
id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(100) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- optional: a table to persist user's tracked lists if you want server-side storage
CREATE TABLE tracked_lists (
id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
user_id INT UNSIGNED NOT NULL,
name VARCHAR(150) DEFAULT 'default',
symbols TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;