const { body, param, validationResult } = require('express-validator');
const Booking = require('../models/booking.model');
const { bookingStatus } = require('../constants/status.enum');

// Validation middleware for creating a booking
exports.validateCreateBooking = [
    body('user').isMongoId().withMessage('Invalid user ID'),
    body('transport').isMongoId().withMessage('Invalid transport ID'),
    body('pickupLocation')
         .trim()
         .notEmpty().withMessage('Pickup location is required')
         .isLength({ min: 3}).withMessage('Pickup location must be at least 3 characters'),
    body('dropoffLocation')
        .trim()
        .notEmpty().withMessage('Drop off location is required')
        .isLength({ min: 3}).withMessage('Dropoff location must at least be 3 characters'),
    body('scheduleDate')
        .isISO8601().withMessage('Invalid date format')
        .custom(value => {
            if (new Date(value) < new Date()) {
                throw new Error('Scheduled date cannot be in the past');
            }
            return true
        }),
    body('status')
        .optional()
        .isIn(Object.values(bookingStatus)).withMessage('Invalid status'),
    body('notes')
        .optional()
        .trim()                  
        .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),

        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        }
];

// Middleware to check if booking exists
exports.checkBookingExists = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        req.booking = booking;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Authorization middleware - check if user owns the booking
exports.authorizeBookingAccess = (req, res, next) => {
    if (req.user.role !== 'admin' && req.boking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this booking' });
    }
    next();
};