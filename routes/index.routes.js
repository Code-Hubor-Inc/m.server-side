//centralized routes managaement: Register each routes under a base URL, helporganize routes in a single place
const express = require('express');
const { protect } = require('../middleware/auth.middleware');   
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();
const cookieParser = require('cookie-parser');
// const bookingRoutes = require('./booking.routes');

// configuring cookiePaser middleware
router.use(cookieParser());
  
const authRoutes = require('./auth.routes');
const bookingRoutes = require('./booking.routes');
const paymentRoutes = require('./payment.routes');
const trackingRoutes = require('./tracking.routes');
const transportRoutes = require('./transport.routes');
const userRoutes = require('./user.routes'); 
// const { authMiddleware } = require('../middleware/auth.middleware');

//register routes
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/booking', bookingRoutes);
router.use('/api/v1/payment', paymentRoutes);
router.use('/api/v1/tracking', trackingRoutes);

router.use('/api/v1/transport', transportRoutes);
router.use('/api/v1/user', userRoutes);

// test route
router.use('/api/v1/health', authMiddleware.protect, (req, res) => {
    res.send(`Hello, ${req.user.name}! Your token is valid `);
    });


module.exports = router;