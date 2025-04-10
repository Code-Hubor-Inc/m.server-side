//Handles tracking of transport and parcel deliveries: getting real-time tracking data and updating tracking status
const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/tracking.controller');
const cacheMiddleware = require('../middleware/redis.cache');
 
router.get('/health', (req, res) => {
    res.json({ message: 'Tracking service is up and running', status: 'OK' });
});
router.get('/', cacheMiddleware('tracks'), trackingController.getTracks);
router.get('/:id', cacheMiddleware('track'), trackingController.getTrackById);

module.exports = router; 