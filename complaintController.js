const pool = require('../config/database');

const createComplaint = async (req, res) => {
  try {
    const { student_id, complaint_type, description, priority } = req.body;
    
    if (!student_id || !description) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and description are required'
      });
    }
    
    const query = `
      INSERT INTO complaints (student_id, complaint_type, description, priority, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *
    `;
    const values = [student_id, complaint_type || 'General', description, priority || 'normal'];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting complaint',
      error: error.message
    });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const query = `
      SELECT c.*, s.first_name, s.last_name, s.student_id, s.room_number
      FROM complaints c 
      LEFT JOIN students s ON c.student_id = s.id 
      ORDER BY 
        CASE c.status 
          WHEN 'pending' THEN 1 
          WHEN 'in-progress' THEN 2 
          ELSE 3 
        END,
        c.created_at DESC
    `;
    const result = await pool.query(query);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

const getComplaintsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const query = `
      SELECT * FROM complaints 
      WHERE student_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [studentId]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching student complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // First check if complaint exists
    const checkQuery = 'SELECT * FROM complaints WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Update complaint status
    let query;
    let values;
    
    if (status === 'resolved') {
      query = `
        UPDATE complaints 
        SET status = $1, resolution_notes = $2, resolution_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;
      values = [status, resolution_notes || null, id];
    } else {
      query = `
        UPDATE complaints 
        SET status = $1, resolution_notes = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;
      values = [status, resolution_notes || null, id];
    }
    
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating complaint',
      error: error.message
    });
  }
};

const getComplaintStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_complaints,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority
      FROM complaints
    `;
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows[0] || { total_complaints: 0, pending: 0, in_progress: 0, resolved: 0, high_priority: 0 }
    });
  } catch (error) {
    console.error('Error fetching complaint stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint statistics',
      error: error.message
    });
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getComplaintsByStudent,
  updateComplaintStatus,
  getComplaintStats
};