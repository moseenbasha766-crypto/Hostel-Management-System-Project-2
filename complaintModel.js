const pool = require('../config/database');

const createComplaintTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS complaints (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
      complaint_type VARCHAR(100),
      description TEXT NOT NULL,
      priority VARCHAR(20) DEFAULT 'normal',
      status VARCHAR(20) DEFAULT 'pending',
      assigned_to VARCHAR(100),
      resolution_date DATE,
      resolution_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Complaints table created');
  } catch (error) {
    console.error('Error creating complaints table:', error);
  }
};

createComplaintTable();

module.exports = {};