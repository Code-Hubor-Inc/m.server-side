/**
 * @ json web token utility
 */

const jwt = require('jsonwebtoken');
const AppError = require('../utils/app.error');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new AppError('Invalid token. Please log in again!', 401);
    }
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined; //remove password from output

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user }
    });
};