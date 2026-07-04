const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// Make sure all controller functions exist before using them
router.post('/', protect, attendanceController.markAttendance);
router.get('/', protect, attendanceController.getAllAttendance);
router.get('/stats', protect, attendanceController.getAttendanceStats);
router.get('/date/:date', protect, attendanceController.getAttendanceByDate);
router.get('/student/:studentId', protect, attendanceController.getAttendanceByStudent);

module.exports = router;