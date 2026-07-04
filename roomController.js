const pool = require('../config/database');

// Remove the createRoomTable call from here
// Room table will be created from server.js after hostels table exists

const createRoom = async (req, res) => {
  try {
    const { 
      room_number, 
      hostel_id, 
      room_type, 
      capacity, 
      rent_amount, 
      floor_number, 
      facilities, 
      status 
    } = req.body;
    
    const existingRoom = await pool.query(
      'SELECT * FROM rooms WHERE hostel_id = $1 AND room_number = $2',
      [hostel_id, room_number]
    );
    
    if (existingRoom.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room number already exists in this hostel'
      });
    }
    
    const query = `
      INSERT INTO rooms (room_number, hostel_id, room_type, capacity, rent_amount, floor_number, facilities, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [room_number, hostel_id, room_type, capacity, rent_amount, floor_number, facilities, status || 'available'];
    
    const result = await pool.query(query, values);
    
    await pool.query(
      'UPDATE hostels SET total_rooms = total_rooms + 1, total_capacity = total_capacity + $1 WHERE id = $2',
      [capacity, hostel_id]
    );
    
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const query = `
      SELECT r.*, h.hostel_name, h.hostel_code 
      FROM rooms r 
      LEFT JOIN hostels h ON r.hostel_id = h.id 
      ORDER BY r.id DESC
    `;
    const result = await pool.query(query);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
};

const getRoomsByHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;
    
    const query = `
      SELECT * FROM rooms 
      WHERE hostel_id = $1 
      ORDER BY floor_number, room_number
    `;
    const result = await pool.query(query, [hostelId]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching rooms by hostel:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
};

const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT r.*, h.hostel_name, h.hostel_code 
      FROM rooms r 
      LEFT JOIN hostels h ON r.hostel_id = h.id 
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message
    });
  }
};

const getAvailableRooms = async (req, res) => {
  try {
    const query = `
      SELECT r.*, h.hostel_name 
      FROM rooms r 
      LEFT JOIN hostels h ON r.hostel_id = h.id 
      WHERE r.status = 'available' AND r.current_occupancy < r.capacity
      ORDER BY r.id DESC
    `;
    const result = await pool.query(query);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available rooms',
      error: error.message
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      room_number, 
      hostel_id, 
      room_type, 
      capacity, 
      rent_amount, 
      floor_number, 
      facilities, 
      status 
    } = req.body;
    
    const oldRoom = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
    if (oldRoom.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const query = `
      UPDATE rooms 
      SET room_number = $1, hostel_id = $2, room_type = $3, capacity = $4, 
          rent_amount = $5, floor_number = $6, facilities = $7, status = $8, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    const values = [room_number, hostel_id, room_type, capacity, rent_amount, floor_number, facilities, status, id];
    
    const result = await pool.query(query, values);
    
    if (oldRoom.rows[0].capacity !== capacity) {
      const capacityDiff = capacity - oldRoom.rows[0].capacity;
      await pool.query(
        'UPDATE hostels SET total_capacity = total_capacity + $1 WHERE id = $2',
        [capacityDiff, hostel_id]
      );
    }
    
    res.json({
      success: true,
      message: 'Room updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message
    });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
    if (room.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const result = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [id]);
    
    await pool.query(
      'UPDATE hostels SET total_rooms = total_rooms - 1, total_capacity = total_capacity - $1 WHERE id = $2',
      [room.rows[0].capacity, room.rows[0].hostel_id]
    );
    
    res.json({
      success: true,
      message: 'Room deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
};

const getRoomStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_rooms,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_rooms,
        SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_rooms,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_rooms,
        SUM(capacity) as total_capacity,
        SUM(current_occupancy) as current_occupancy
      FROM rooms
    `;
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching room stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room statistics',
      error: error.message
    });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomsByHostel,
  getRoomById,
  getAvailableRooms,
  updateRoom,
  deleteRoom,
  getRoomStats
};