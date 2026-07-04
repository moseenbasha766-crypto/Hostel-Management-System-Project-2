const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, studentController.createStudent);
router.get('/', protect, studentController.getAllStudents);
router.get('/:id', protect, studentController.getStudentById);
router.put('/:id', protect, adminOnly, studentController.updateStudent);
router.delete('/:id', protect, adminOnly, studentController.deleteStudent);

module.exports = router;