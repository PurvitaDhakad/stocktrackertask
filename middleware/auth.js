const bcrypt = require('bcrypt');
const pool = require('../utils/db'); // your MySQL database connection

async function signup(username, password) {
    // Check if user already exists
    const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
        throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
    );

    return { id: result.insertId, username };
}

module.exports = { signup };
