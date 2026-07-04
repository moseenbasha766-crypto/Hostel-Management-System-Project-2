const pool = require('../config/database');

const addOrUpdateMenu = async (req, res) => {
  try {
    const { day_of_week, meal_type, menu_items } = req.body;
    
    // Validate input
    if (!day_of_week || !meal_type) {
      return res.status(400).json({
        success: false,
        message: 'Day of week and meal type are required'
      });
    }
    
    // Check if menu already exists
    const existing = await pool.query(
      'SELECT * FROM mess_menu WHERE day_of_week = $1 AND meal_type = $2',
      [day_of_week, meal_type]
    );
    
    let result;
    
    if (existing.rows.length > 0) {
      // Update existing menu
      const updateQuery = `
        UPDATE mess_menu 
        SET menu_items = $1, updated_at = CURRENT_TIMESTAMP
        WHERE day_of_week = $2 AND meal_type = $3
        RETURNING *
      `;
      result = await pool.query(updateQuery, [menu_items, day_of_week, meal_type]);
      
      return res.json({
        success: true,
        message: 'Menu updated successfully',
        data: result.rows[0]
      });
    } else {
      // Insert new menu
      const insertQuery = `
        INSERT INTO mess_menu (day_of_week, meal_type, menu_items)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      result = await pool.query(insertQuery, [day_of_week, meal_type, menu_items]);
      
      return res.status(201).json({
        success: true,
        message: 'Menu added successfully',
        data: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating menu',
      error: error.message
    });
  }
};

const getMessMenu = async (req, res) => {
  try {
    const query = `
      SELECT * FROM mess_menu 
      ORDER BY 
        CASE day_of_week
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
          ELSE 8
        END,
        CASE meal_type
          WHEN 'breakfast' THEN 1
          WHEN 'lunch' THEN 2
          WHEN 'dinner' THEN 3
          ELSE 4
        END
    `;
    const result = await pool.query(query);
    
    // Group by day
    const groupedMenu = {};
    result.rows.forEach(item => {
      if (!groupedMenu[item.day_of_week]) {
        groupedMenu[item.day_of_week] = {};
      }
      groupedMenu[item.day_of_week][item.meal_type] = item.menu_items;
    });
    
    res.json({
      success: true,
      data: result.rows,
      grouped: groupedMenu
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu',
      error: error.message
    });
  }
};

const markMessAttendance = async (req, res) => {
  try {
    const { student_id, date, meal_type, status } = req.body;
    
    if (!student_id || !meal_type) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and meal type are required'
      });
    }
    
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    const attendanceStatus = status || 'present';
    
    // Check if student exists
    const studentCheck = await pool.query('SELECT id FROM students WHERE id = $1', [student_id]);
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Check if attendance already exists
    const existing = await pool.query(
      'SELECT * FROM mess_attendance WHERE student_id = $1 AND date = $2 AND meal_type = $3',
      [student_id, attendanceDate, meal_type]
    );
    
    let result;
    
    if (existing.rows.length > 0) {
      // Update existing
      const updateQuery = `
        UPDATE mess_attendance 
        SET status = $1
        WHERE student_id = $2 AND date = $3 AND meal_type = $4
        RETURNING *
      `;
      result = await pool.query(updateQuery, [attendanceStatus, student_id, attendanceDate, meal_type]);
      
      return res.json({
        success: true,
        message: 'Mess attendance updated successfully',
        data: result.rows[0]
      });
    } else {
      // Create new
      const insertQuery = `
        INSERT INTO mess_attendance (student_id, date, meal_type, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      result = await pool.query(insertQuery, [student_id, attendanceDate, meal_type, attendanceStatus]);
      
      return res.status(201).json({
        success: true,
        message: 'Mess attendance marked successfully',
        data: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Error marking mess attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking mess attendance',
      error: error.message
    });
  }
};

const getMessAttendance = async (req, res) => {
  try {
    const { date } = req.params;
    
    const query = `
      SELECT ma.*, s.first_name, s.last_name, s.student_id 
      FROM mess_attendance ma 
      LEFT JOIN students s ON ma.student_id = s.id 
      WHERE ma.date = $1
      ORDER BY s.first_name
    `;
    const result = await pool.query(query, [date]);
    
    // Group by meal type
    const groupedAttendance = {
      breakfast: [],
      lunch: [],
      dinner: []
    };
    
    result.rows.forEach(record => {
      if (groupedAttendance[record.meal_type]) {
        groupedAttendance[record.meal_type].push(record);
      }
    });
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
      grouped: groupedAttendance
    });
  } catch (error) {
    console.error('Error fetching mess attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mess attendance',
      error: error.message
    });
  }
};

const getMessStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT student_id) as total_students,
        COUNT(*) as total_meals,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as meals_served,
        ROUND(100.0 * SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as attendance_rate
      FROM mess_attendance 
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    `;
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows[0] || { total_students: 0, total_meals: 0, meals_served: 0, attendance_rate: 0 }
    });
  } catch (error) {
    console.error('Error fetching mess stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mess statistics',
      error: error.message
    });
  }
};

module.exports = {
  addOrUpdateMenu,
  getMessMenu,
  markMessAttendance,
  getMessAttendance,
  getMessStats
};