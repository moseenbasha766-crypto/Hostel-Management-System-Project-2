const pool = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    // Get total students
    const studentsResult = await pool.query('SELECT COUNT(*) as count FROM students');
    const totalStudents = parseInt(studentsResult.rows[0]?.count || 0);
    
    // Get active students
    const activeStudentsResult = await pool.query("SELECT COUNT(*) as count FROM students WHERE status = 'active'");
    const activeStudents = parseInt(activeStudentsResult.rows[0]?.count || 0);
    
    // Get total hostels
    const hostelsResult = await pool.query('SELECT COUNT(*) as count FROM hostels');
    const totalHostels = parseInt(hostelsResult.rows[0]?.count || 0);
    
    // Get total rooms
    const roomsResult = await pool.query('SELECT COUNT(*) as count FROM rooms');
    const totalRooms = parseInt(roomsResult.rows[0]?.count || 0);
    
    // Get occupied rooms (students with room numbers)
    let occupiedRooms = 0;
    try {
      const occupiedResult = await pool.query('SELECT COUNT(DISTINCT room_number) as count FROM students WHERE room_number IS NOT NULL AND room_number != \'\'');
      occupiedRooms = parseInt(occupiedResult.rows[0]?.count || 0);
    } catch (err) {
      console.log('Error getting occupied rooms:', err.message);
    }
    
    // Get recent students
    let recentStudents = [];
    try {
      const recentResult = await pool.query(`
        SELECT id, student_id, first_name, last_name, email, phone, room_number, course, status 
        FROM students 
        ORDER BY id DESC 
        LIMIT 5
      `);
      recentStudents = recentResult.rows;
    } catch (err) {
      console.log('Error fetching recent students:', err.message);
    }
    
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        totalHostels,
        totalRooms,
        occupiedRooms,
        vacantRooms: totalRooms - occupiedRooms,
        occupancyRate: parseFloat(occupancyRate),
        pendingComplaints: 0,
        recentStudents
      }
    });
  } catch (error) {
    console.error('Error in dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

module.exports = { getDashboardStats };