const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostelController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, hostelController.createHostel);
router.get('/', protect, hostelController.getAllHostels);
router.get('/:id', protect, hostelController.getHostelById);
router.put('/:id', protect, adminOnly, hostelController.updateHostel);
router.delete('/:id', protect, adminOnly, hostelController.deleteHostel);

module.exports = router;