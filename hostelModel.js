const pool = require('../config/database');

const createHostelTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS hostels (
      id SERIAL PRIMARY KEY,
      hostel_name VARCHAR(100) NOT NULL,
      hostel_code VARCHAR(20) UNIQUE NOT NULL,
      address TEXT,
      total_rooms INTEGER DEFAULT 0,
      total_capacity INTEGER DEFAULT 0,
      warden_name VARCHAR(100),
      warden_phone VARCHAR(20),
      warden_email VARCHAR(100),
      contact_number VARCHAR(20),
      email VARCHAR(100),
      facilities TEXT[],
      mess_available BOOLEAN DEFAULT false,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Hostels table created');
  } catch (error) {
    console.error('Error creating hostels table:', error);
  }
};

// Don't call createHostelTable here - will be called from a central place

const createHostel = async (hostelData) => {
  const { hostel_name, hostel_code, address, total_rooms, total_capacity, warden_name, warden_phone, warden_email, contact_number, email, facilities, mess_available } = hostelData;
  const query = `
    INSERT INTO hostels (hostel_name, hostel_code, address, total_rooms, total_capacity, warden_name, warden_phone, warden_email, contact_number, email, facilities, mess_available)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;
  const values = [hostel_name, hostel_code, address, total_rooms, total_capacity, warden_name, warden_phone, warden_email, contact_number, email, facilities, mess_available];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const getAllHostels = async () => {
  const query = 'SELECT * FROM hostels ORDER BY id DESC';
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

const getHostelById = async (id) => {
  const query = 'SELECT * FROM hostels WHERE id = $1';
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const updateHostel = async (id, hostelData) => {
  const { hostel_name, address, total_rooms, total_capacity, warden_name, warden_phone, warden_email, contact_number, email, facilities, mess_available, status } = hostelData;
  const query = `
    UPDATE hostels 
    SET hostel_name = $1, address = $2, total_rooms = $3, total_capacity = $4, 
        warden_name = $5, warden_phone = $6, warden_email = $7, contact_number = $8, 
        email = $9, facilities = $10, mess_available = $11, status = $12, updated_at = CURRENT_TIMESTAMP
    WHERE id = $13
    RETURNING *
  `;
  const values = [hostel_name, address, total_rooms, total_capacity, warden_name, warden_phone, warden_email, contact_number, email, facilities, mess_available, status, id];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const deleteHostel = async (id) => {
  const query = 'DELETE FROM hostels WHERE id = $1 RETURNING *';
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = { createHostel, getAllHostels, getHostelById, updateHostel, deleteHostel, createHostelTable };