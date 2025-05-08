/**
 * tracking routes
 */

const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/tracking.controller');
const trackingMiddleware = require('../middleware/tracking.middleware');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication to all tracking routes
router.use(authMiddleware.protect);

// Driver/Admin endpounts
router.post(
    '/',
    authMiddleware.restrictTo('admin', 'driver'),
    trackingMiddleware.validateTrackingEvent,
    trackingController.createTrackingEvent
);

// Customer/admin/driver endpoints
router.get(
    '/booking/:bookingId',
    trackingMiddleware.checkBookingAccess,
    trackingController.getTrackingHistory
);

router.get(
    '/booking/:bookingId/current',
    trackingMiddleware.checkBookingAccess,
    trackingController.getCurrentStatus
);

module.exports = router;