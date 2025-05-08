/**
 * @transport routes
 */

const express = require('express');
const router = express.Router();
const TransportController = require('../controllers/transport.controller');
const transportMiddleware = require('../middleware/transport.middleware');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication to all transport routes
router.use(authMiddleware.protect);

// Admin-only routes
router.post(
    '/',
    authMiddleware.restrictTo('admin'),
    transportMiddleware.validateTransportCreation,
    TransportController.createTransport
);

router.patch(
    '/:id',
    authMiddleware.restrictTo('admin'),
    transportMiddleware.checkTransportExists,
    transportMiddleware.validateTransportUpdate,
    TransportController.updateTransport
);

router.delete(
    '/:id',
    authMiddleware.restrictTo('delete'),
    transportMiddleware.checkTransportExists,
    TransportController.deactivateTransport
);

router.post(
    '/:id/maintenace',
    authMiddleware.restrictTo('admin'),
    transportMiddleware.checkTransportExists,
    transportMiddleware.validateMaintenanceRecord,
    TransportController.addMaintenanceRecord
);

// General access routes
router.get(
    '/',
    TransportController.validateCoordinates,
);

router.get(
    '/nearby',
    transportMiddleware.validateCoordinates,
    TransportController.findNearbyTransports
);

router.get(
    '/:id',
    transportMiddleware.checkTransportExists,
    TransportController.getTransportById
);

module.exports = router;