/**
 * 
 */
 
const { body, param, validationResult } = require('express-validator');
const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');
const { paymentMethods } = require('../constants/payment.enum');

exports.validatePaymentInitiation = [
    body('bookingId')
    .isMongoId().withMessage('Invalid booking ID')
    .custom(async (value, { req }) => {
        const booking = await Booking.findById(value);
        if (!booking) throw new Error('Booking not found');
        if (booking.user.toString() !== req.user._id.toString()) {
            throw new Error('Not authorized for this booking');
        }
        return true;
    }),
    body('paymentMethod')
    .isIn(Object.values(paymentMethods)).withMessage('Invalid payment method'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        next();
    }
];

exports.validateRefundRequest = [
    body('paymentId')
       .isMongoId().withMessage('Invalid payment ID'),
    body('refundAmount')
       .isFloat({ gt: 0 }).withMessage('Refund amount must be positive'),
    body('reason')
       .optional()
       .trim()
       .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
       
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        next();
    }   
];

exports.checkPaymentExists = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        req.payment = payment;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.authorizePaymentAccess = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.payment.user.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this payment'
        });
    }
    next();
};