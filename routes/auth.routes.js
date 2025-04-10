//Handles user authentication: user login, user registration, password reset, oken verification
const express = require('express'); 
const jwt = require('jsonwebtoken');
const router = express.Router(); 
const { signup } = require('../controllers/auth.controller');
const User = require('../models/user.model');

//user registration
router.post('/signup', signup);

//user login (replace with proper controller logic) 
router.post('/login', (req, res) => {
    res.send('Login successful');
})

//Authentication middlware: verifies JWT token 
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unouthorized' });

    try {
        //jwt.verify() should be provided the token and secret 
        const decoded = jwt.verify(process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};
// Authorization middleware: check if user's role is allowed
// updated: now checks if req.user.role is included in the allowed roles array passed parameters
const authorizeRole = (allowedRoles) => (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied'});
    }
    next();
};

// admin dashboard: uses authenticate and authorizeRole middleware
router.get('/admin/dashboard', authenticate, authorizeRole(['Admin']), (req, res) => {
    res.join({ message: 'Welcome to the admin Dashboard', data: { user: ['User1', 'USer2'] } });
});

// customer dashboard: accesssible by customer and admin
router.get('/customer/dashboard', authenticate, authorizeRole(['Customer', 'Admin']), (req, res) => {
    res.json({ message: 'Welcome to the Customer Dashboard', data: { orders: ['Order1', 'Order2'] } });
});

// Example route to get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;  
