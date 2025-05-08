// Handles payment transactions and processing: initiate a payment and verify payment status

const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const paymentMiddleware = require('../middleware/payment.middleware');
const authMiddleware = require('../middleware/auth.middleware')

// Apply authentication to all payment routes
router.use(authMiddleware.protect);

// Customer payment endpoints
router.post(
    '/initiate',
    authMiddleware.restrictTo('customer'),
    paymentMiddleware.validatePaymentInitiation,
    PaymentController.initiatePayment
);

router.get(
    '/:id',
    paymentMiddleware.checkPaymentExists,
    paymentMiddleware.validatePaymentInitiation,
    PaymentController.getPaymentDetails
);

// Admin endpoints
router.get(
    '/refund',
    authMiddleware.restrictTo('admin'),
    paymentMiddleware.validateRefundRequest,
    PaymentController.processRefunds
);

module.exports = router;