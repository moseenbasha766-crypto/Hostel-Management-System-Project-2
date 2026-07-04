const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, paymentController.createPayment);
router.get('/', protect, paymentController.getAllPayments);
router.get('/summary', protect, paymentController.getPaymentSummary);
router.get('/student/:studentId', protect, paymentController.getPaymentsByStudent);

module.exports = router;