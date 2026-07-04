const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, roomController.createRoom);
router.get('/', protect, roomController.getAllRooms);
router.get('/available', protect, roomController.getAvailableRooms);
router.get('/stats', protect, roomController.getRoomStats);
router.get('/hostel/:hostelId', protect, roomController.getRoomsByHostel);
router.get('/:id', protect, roomController.getRoomById);
router.put('/:id', protect, adminOnly, roomController.updateRoom);
router.delete('/:id', protect, adminOnly, roomController.deleteRoom);

module.exports = router;