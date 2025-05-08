/**
 * @tracking middleware
 */

const { body, param, validationResult } = require('express-validator');
const Booking = require('../models/booking.model');
const { trackingEvents } = require('../constants/tracking.enum.js');

exports.validateTrackingEvent = [
    body('bookingId')
        .isMongoId().withMessage('Invalid booking ID'),
    body('eventType')
        .isIn(Object.values(trackingEvents)).withMessage('Invalid event type'),
    body('location.coordinates')
        .isArray({ min: 2, max: 2 }).withMessage('Cordinates must be an array of two numbers')
        .custom(coords => {
            if (coords.some(isNaN)) throw new Error('Cordinates must be numbers');
            return true;
        }),
    body('location.address')
        .notEmpty().withMessage('Address is required')
        .trim()
        .isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
        
    (req, res, next) => {
        const errors = validateionResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }    
];

exports.checkBookingAccess = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user has access
        if (req.user.role === 'customer' &&
            booking.user.toString() !== req.user._id.toString() &&
            (!req.user.transport || booking.transport.toString() !== req.user.transport.toString())) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this booking'
                });
            }

            req.booking = booking;
            next();
         } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
         }
    };
