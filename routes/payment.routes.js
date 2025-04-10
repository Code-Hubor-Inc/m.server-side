// Handles payment transactions and processing: initiate a payment and verify payment status
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const cacheMiddleware = require('../middleware/redis.cache');
 
router.get('/health', (req, res) => {
    res.json({ message: 'Payment route is working', status: 'OK'});
});
router.get('/', cacheMiddleware('payments'), paymentController.getPayments);
router.get('/:id', cacheMiddleware('payment'), paymentController.getPaymentById);

module.exports = router;  
