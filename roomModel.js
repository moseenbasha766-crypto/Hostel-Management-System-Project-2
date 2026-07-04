const pool = require('../config/database');

const createRoomTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      room_number VARCHAR(20) NOT NULL,
      hostel_id INTEGER REFERENCES hostels(id) ON DELETE CASCADE,
      room_type VARCHAR(50),
      capacity INTEGER DEFAULT 1,
      current_occupancy INTEGER DEFAULT 0,
      rent_amount DECIMAL(10,2),
      floor_number INTEGER,
      facilities TEXT[],
      status VARCHAR(20) DEFAULT 'available',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(hostel_id, room_number)
    )
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Rooms table created');
  } catch (error) {
    console.error('Error creating rooms table:', error);
  }
};

createRoomTable();

module.exports = {};