// handles transport related operations: gets transport details and list all transport options.
const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transport.controller');
const cacheMiddleware = require('../middleware/redis.cache');

// health check route
router.get('/health', (req, res) => {
    res.send({ message:'Transport route is working' });
});

// get all transport (with caching)
router.get('/', cacheMiddleware('transports'), transportController.getTransports);

// get all transport by ID (with caching)
router.get('/:id', cacheMiddleware('transport'), transportController.getTransportsById);


module.exports = router;  