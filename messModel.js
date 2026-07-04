const pool = require('../config/database');

const createMessTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS mess_menu (
      id SERIAL PRIMARY KEY,
      day_of_week VARCHAR(20),
      meal_type VARCHAR(20),
      menu_items TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Mess menu table created');
  } catch (error) {
    console.error('Error creating mess menu table:', error);
  }
};

createMessTable();

module.exports = {};