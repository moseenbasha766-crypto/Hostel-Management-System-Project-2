const pool = require('../config/database');

// Create Payment Table
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

// Create payment
const createPayment = async (req, res) => {
  try {
    const { student_id, amount, due_date, payment_method, transaction_id, payment_type, description, status } = req.body;
    
    const query = `
      INSERT INTO payments (student_id, amount, due_date, payment_method, transaction_id, payment_type, description, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [student_id, amount, due_date, payment_method, transaction_id, payment_type, description, status || 'completed'];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording payment',
      error: error.message
    });
  }
};

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const query = `
      SELECT p.*, s.first_name, s.last_name, s.student_id 
      FROM payments p 
      LEFT JOIN students s ON p.student_id = s.id 
      ORDER BY p.payment_date DESC
    `;
    const result = await pool.query(query);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// Get payments by student
const getPaymentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const query = `
      SELECT * FROM payments 
      WHERE student_id = $1 
      ORDER BY payment_date DESC
    `;
    const result = await pool.query(query, [studentId]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// Get payment summary
const getPaymentSummary = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_amount,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as collected_amount,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
      FROM payments
    `;
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment summary',
      error: error.message
    });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentsByStudent,
  getPaymentSummary
};