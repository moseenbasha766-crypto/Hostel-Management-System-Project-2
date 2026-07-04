const pool = require('../config/database');

const createStudent = async (studentData) => {
  const { 
    student_id, first_name, last_name, email, phone, date_of_birth, 
    gender, address, hostel_id, room_number, course, year_of_study,
    father_name, mother_name, emergency_contact, emergency_contact_name,
    joining_date, status
  } = studentData;
  
  const query = `
    INSERT INTO students (
      student_id, first_name, last_name, email, phone, date_of_birth, 
      gender, address, hostel_id, room_number, course, year_of_study,
      father_name, mother_name, emergency_contact, emergency_contact_name,
      joining_date, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *
  `;
  
  const values = [
    student_id,
    first_name,
    last_name,
    email,
    phone || null,
    date_of_birth || null,
    gender || null,
    address || null,
    hostel_id && hostel_id !== '' ? parseInt(hostel_id) : null,
    room_number || null,
    course,
    year_of_study ? parseInt(year_of_study) : null,
    father_name || null,
    mother_name || null,
    emergency_contact || null,
    emergency_contact_name || null,
    joining_date || new Date().toISOString().split('T')[0],
    status || 'active'
  ];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Database error in createStudent:', error);
    throw error;
  }
};

const getAllStudents = async () => {
  const query = `
    SELECT s.*, h.hostel_name 
    FROM students s 
    LEFT JOIN hostels h ON s.hostel_id = h.id 
    ORDER BY s.id DESC
  `;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

const getStudentById = async (id) => {
  const query = `
    SELECT s.*, h.hostel_name 
    FROM students s 
    LEFT JOIN hostels h ON s.hostel_id = h.id 
    WHERE s.id = $1
  `;
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching student by ID:', error);
    throw error;
  }
};

const updateStudent = async (id, studentData) => {
  const { 
    first_name, last_name, email, phone, address, hostel_id, 
    room_number, course, year_of_study, father_name, mother_name,
    emergency_contact, emergency_contact_name, status
  } = studentData;
  
  const query = `
    UPDATE students 
    SET first_name = $1, last_name = $2, email = $3, phone = $4, address = $5, 
        hostel_id = $6, room_number = $7, course = $8, year_of_study = $9, 
        father_name = $10, mother_name = $11, emergency_contact = $12, 
        emergency_contact_name = $13, status = $14, updated_at = CURRENT_TIMESTAMP
    WHERE id = $15
    RETURNING *
  `;
  
  const values = [
    first_name,
    last_name,
    email,
    phone || null,
    address || null,
    hostel_id ? parseInt(hostel_id) : null,
    room_number || null,
    course,
    year_of_study ? parseInt(year_of_study) : null,
    father_name || null,
    mother_name || null,
    emergency_contact || null,
    emergency_contact_name || null,
    status || 'active',
    id
  ];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

const deleteStudent = async (id) => {
  const query = 'DELETE FROM students WHERE id = $1 RETURNING *';
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};