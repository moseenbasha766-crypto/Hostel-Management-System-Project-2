const pool = require('../config/database');

// Hostel table creation
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

// Student table creation
const createStudentTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      student_id VARCHAR(50) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20),
      date_of_birth DATE,
      gender VARCHAR(10),
      address TEXT,
      hostel_id INTEGER REFERENCES hostels(id) ON DELETE SET NULL,
      room_number VARCHAR(20),
      course VARCHAR(100),
      year_of_study INTEGER,
      father_name VARCHAR(100),
      mother_name VARCHAR(100),
      emergency_contact VARCHAR(20),
      emergency_contact_name VARCHAR(100),
      joining_date DATE DEFAULT CURRENT_DATE,
      leaving_date DATE,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.query(query);
    console.log('✅ Students table created');
  } catch (error) {
    console.error('Error creating students table:', error);
  }
};

// Room table creation
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

// Payment table creation
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

// Complaint table creation
const createComplaintTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS complaints (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
      complaint_type VARCHAR(100),
      description TEXT NOT NULL,
      priority VARCHAR(20) DEFAULT 'normal',
      status VARCHAR(20) DEFAULT 'pending',
      assigned_to VARCHAR(100),
      resolution_date DATE,
      resolution_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.query(query);
    console.log('✅ Complaints table created');
  } catch (error) {
    console.error('Error creating complaints table:', error);
  }
};

// Attendance table creation
const createAttendanceTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL,
      date DATE DEFAULT CURRENT_DATE,
      status VARCHAR(20) DEFAULT 'present',
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.query(query);
    // Add foreign key constraint separately
    await pool.query(`
      ALTER TABLE attendance 
      ADD CONSTRAINT fk_attendance_student 
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    `);
    console.log('✅ Attendance table created');
  } catch (error) {
    console.error('Error creating attendance table:', error);
  }
};

// Mess Menu table creation
const createMessMenuTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS mess_menu (
      id SERIAL PRIMARY KEY,
      day_of_week VARCHAR(20),
      meal_type VARCHAR(20),
      menu_items TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(day_of_week, meal_type)
    )
  `;
  try {
    await pool.query(query);
    console.log('✅ Mess menu table created');
  } catch (error) {
    console.error('Error creating mess menu table:', error);
  }
};

// Mess Attendance table creation
const createMessAttendanceTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS mess_attendance (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
      date DATE DEFAULT CURRENT_DATE,
      meal_type VARCHAR(20),
      status VARCHAR(20) DEFAULT 'present',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, date, meal_type)
    )
  `;
  try {
    await pool.query(query);
    console.log('✅ Mess attendance table created');
  } catch (error) {
    console.error('Error creating mess attendance table:', error);
  }
};

// Initialize all tables in correct order
const initTables = async () => {
  try {
    // First create tables without foreign key dependencies
    await createHostelTable();
    
    // Then create tables that reference hostels
    await createStudentTable();
    await createRoomTable();
    
    // Then create tables that reference students
    await createPaymentTable();
    await createComplaintTable();
    await createAttendanceTable();
    await createMessAttendanceTable();
    
    // Finally create mess menu (no dependencies)
    await createMessMenuTable();
    
    console.log('✅ All tables initialized successfully');
  } catch (error) {
    console.error('Error initializing tables:', error);
  }
};

// Export the function
module.exports = { initTables };