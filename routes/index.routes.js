//centralized routes managaement: Register each routes under a base URL, helporganize routes in a single place
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const bookingRoutes = require('./booking.routes');
const paymentRoutes = require('./payment.routes');
const trackingRoutes = require('./tracking.routes');
const transportRoutes = require('./transport.routes');
const userRoutes = require('./user.routes'); 


// test route
// router.use('/api', (req, res) => {
//      res.json({ message: 'API is working' });
//      });

//register routes
router.use('/api/auth', authRoutes);
router.use('/api/booking', bookingRoutes);
router.use('/api/payment', paymentRoutes);
router.use('/api/tracking', trackingRoutes);
router.use('/api/transport', transportRoutes);
router.use('/api/user', userRoutes);

module.exports = router;