const express = require('express');
const router = express.Router();
const messController = require('../controllers/messController');
const { protect } = require('../middleware/authMiddleware');

router.post('/menu', protect, messController.addOrUpdateMenu);
router.get('/menu', protect, messController.getMessMenu);
router.post('/attendance', protect, messController.markMessAttendance);
router.get('/attendance/:date', protect, messController.getMessAttendance);
router.get('/stats', protect, messController.getMessStats);

module.exports = router;