const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();


const pool = mysql.createPool({
host: process.env.DB_HOST || 'localhost',
port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
user: process.env.DB_USER || 'root',
password: process.env.DB_PASS || '',
database: process.env.DB_NAME || 'stocktracker',
waitForConnections: true,
connectionLimit: 10,
queueLimit: 0
});
pool.getConnection()
  .then(conn => {
    console.log("Database got connected successfully");
    conn.release();
  })
  .catch(err => {
    console.error("Database connection failed:", err);
  });

module.exports = pool;