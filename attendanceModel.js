const pool = require('../config/database');

const createAttendanceTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
      date DATE DEFAULT CURRENT_DATE,
      check_in_time TIME,
      check_out_time TIME,
      status VARCHAR(20) DEFAULT 'present',
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, date)
    )
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Attendance table created');
  } catch (error) {
    console.error('Error creating attendance table:', error);
  }
};

createAttendanceTable();

module.exports = {};