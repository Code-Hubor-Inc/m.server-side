//Manages user related operations: Get user profile, Update user profile, Delete user account
const express = require('express');
// const verifyToken = require('../middleware/auth.middleware'); //originally was like this { verifyToken }.
const { authMiddleware, restrictTo } = require('../middleware/auth.middleware'); 
const router = express.Router();
const userController = require('../controllers/user.controller');
const cacheMiddleware = require('../middleware/redis.cache');
const { getUserById, getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/user.controller'); 
const User = require('../models/user.model');

// Routes
router.get('/user/:id', authMiddleware, restrictTo('admin'), getUserById);
router.get('/users', authMiddleware, restrictTo('admin'), getAllUsers);
router.post('/user', authMiddleware, restrictTo('admin'), createUser);
router.put('/user/:id', authMiddleware, restrictTo('admin'), updateUser);
router.delete('/user/:id', authMiddleware, restrictTo('admin'), deleteUser);

// caching and middleware caching
router.get('/', cacheMiddleware('users'), userController.getAllUsers);
router.get('/:id', cacheMiddleware('user'), userController.getUserById);

module.exports = router; 