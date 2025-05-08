/**
 * Handles user authentication: user login, user registration, password reset and token verification
 * 
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 mins
    max: 5,
    message: 'Too many login attempts from this IP, please try again after 15 minutes' 
});

router.post('/register', authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch('/update-password', authMiddleware.protect, authController.updatePassword);

module.exports = router;