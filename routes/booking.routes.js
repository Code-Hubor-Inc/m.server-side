const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');
const bookingMiddleware = require('../middleware/booking.middleware');

// Apply authentication middlware to all booking routes
router.use(authMiddleware.protect);

// create a booking
router.post(
    '/',
    authMiddleware.restrictTo('customer'),
    bookingMiddleware.validateCreateBooking,
    BookingController.createBooking
);

// get all bookings (with filters)
router.get(
    '/',
    authMiddleware.restrictTo('admin', 'driver'),
    BookingController.getBookings //small change
);

// get user's own bookings
router.get(
    '/my-bookings/:id',
    authMiddleware.restrictTo('customer'),
    (req, res, next) => {
        req.query.user = req.user._id;
        next();
    },
    BookingController.getBookings
);

// get single booking
router.get(
    '/:id',
    bookingMiddleware.checkBookingExists,
    bookingMiddleware.authorizeBookingAccess,
    BookingController.getBooking
);

// updating booking status
router.patch(
    '/:id/status',
    authMiddleware.restrictTo('admin', 'driver'),
    bookingMiddleware.checkBookingExists,
    BookingController.updateBookingStatus
);

module.exports = router;