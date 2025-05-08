/**
 * 
 * user middleware
 */

const { body, params } = require('express-validator');
const User = require('../models/user.model');

exports.checkUserExists = async (req, res, next) => {
    const user = await User.findById(req.param.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    req.targetUser = user;
    next();
};

exports.validateUserUpdate = [
    body('email')
         .optional()
         .isEmail().withMessage('Invalid email address'),
    body('phone')
        .optional()
        .isIn([ 'admin', 'driver', 'customer']).withMessage('Invalid role'),
    (req, res, next) => {
        const errors = validatinResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array });
        }
        next();
    }         
];