const pool = require('../config/database');

const createPaymentTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL,
      payment_date DATE DEFAULT CURRENT_DATE,
      due_date DATE,
      payment_method VARCHAR(50),
      transaction_id VARCHAR(100),
      payment_type VARCHAR(50),
      description TEXT,
      receipt_number VARCHAR(100),
      status VARCHAR(20) DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Payments table created');
  } catch (error) {
    console.error('Error creating payments table:', error);
  }
};

createPaymentTable();

module.exports = {};