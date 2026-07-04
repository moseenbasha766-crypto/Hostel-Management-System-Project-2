const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, complaintController.createComplaint);
router.get('/', protect, complaintController.getAllComplaints);
router.get('/stats', protect, complaintController.getComplaintStats);
router.get('/student/:studentId', protect, complaintController.getComplaintsByStudent);
router.put('/:id', protect, complaintController.updateComplaintStatus);

module.exports = router;