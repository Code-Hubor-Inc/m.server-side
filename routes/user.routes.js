/**
 * Manages user related operations: Get user profile, Update user profile, delete account
 * 
 */
 
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const userMiddleware = require('../middleware/user.middleware');

router.use(authMiddleware.protect);

router.get('/me', UserController.getMe);
router.patch('/update-me', UserController.updateMe);
router.delete('/deactivate-me', UserController.deactivateMe);

// Admin only routes
router.use(authMiddleware.restrictTo('admin'));


router.get('/', UserController.getAllUsers);
router.get('/create-user', UserController.createUser);
router.get('/:id', userMiddleware.checkUserExists, UserController.getUserById);
router.patch('/:id', userMiddleware.checkUserExists, userMiddleware.validateUserUpdate, UserController.updateUser);
router.delete('/:id', userMiddleware.checkUserExists, UserController.deleteUser);

module.exports = router;