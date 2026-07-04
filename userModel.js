const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const createUserTable = async () => {
  // First drop existing table if it has wrong structure
  try {
    await pool.query(`DROP TABLE IF EXISTS users CASCADE`);
    console.log('✅ Dropped existing users table');
  } catch (error) {
    console.log('No existing users table to drop');
  }
  
  const query = `
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      name VARCHAR(100),
      phone VARCHAR(20),
      last_login TIMESTAMP,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Users table created');
    
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)",
      ['admin@hostel.com', hashedPassword, 'Admin User', 'admin']
    );
    console.log('✅ Default admin created: admin@hostel.com / admin123');
  } catch (error) {
    console.error('Error creating users table:', error);
  }
};

// Call this immediately
createUserTable();

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const updateLastLogin = async (userId) => {
  const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
  await pool.query(query, [userId]);
};

module.exports = { findUserByEmail, updateLastLogin }; 