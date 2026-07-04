const pool = require('../config/database');

const markAttendance = async (req, res) => {
  try {
    let { student_id, date, status, remarks } = req.body;
    
    student_id = parseInt(student_id);
    
    if (!student_id || isNaN(student_id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid Student ID is required'
      });
    }
    
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    const attendanceStatus = status || 'present';
    
    const studentCheck = await pool.query('SELECT id FROM students WHERE id = $1', [student_id]);
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    const existing = await pool.query(
      'SELECT * FROM attendance WHERE student_id = $1 AND date = $2',
      [student_id, attendanceDate]
    );
    
    let result;
    
    if (existing.rows.length > 0) {
      // Update existing attendance (without updated_at)
      const updateQuery = `
        UPDATE attendance 
        SET status = $1, remarks = $2
        WHERE student_id = $3 AND date = $4
        RETURNING *
      `;
      result = await pool.query(updateQuery, [attendanceStatus, remarks, student_id, attendanceDate]);
      
      return res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: result.rows[0]
      });
    } else {
      // Create new attendance
      const insertQuery = `
        INSERT INTO attendance (student_id, date, status, remarks)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      result = await pool.query(insertQuery, [student_id, attendanceDate, attendanceStatus, remarks]);
      
      return res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        data: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
};

const getAllAttendance = async (req, res) => {
  try {
    const query = `
      SELECT a.*, s.first_name, s.last_name, s.student_id 
      FROM attendance a 
      LEFT JOIN students s ON a.student_id = s.id 
      ORDER BY a.date DESC, a.id DESC
    `;
    const result = await pool.query(query);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
};

const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    const query = `
      SELECT a.*, s.first_name, s.last_name, s.student_id 
      FROM attendance a 
      LEFT JOIN students s ON a.student_id = s.id 
      WHERE a.date = $1
      ORDER BY s.first_name
    `;
    const result = await pool.query(query, [date]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
};

const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const query = `
      SELECT * FROM attendance 
      WHERE student_id = $1 
      ORDER BY date DESC
    `;
    const result = await pool.query(query, [studentId]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
};

const getAttendanceStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        ROUND(100.0 * SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as attendance_percentage
      FROM attendance 
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    `;
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows[0] || { total_records: 0, present_count: 0, absent_count: 0, attendance_percentage: 0 }
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance statistics',
      error: error.message
    });
  }
};

module.exports = {
  markAttendance,
  getAllAttendance,
  getAttendanceByDate,
  getAttendanceByStudent,
  getAttendanceStats
};