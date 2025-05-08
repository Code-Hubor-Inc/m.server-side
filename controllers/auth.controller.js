/**
 * @auth controller
 */

const User = require('../models/user.model');
const AppError = require('../utils/app.error');
const { clearCache } = require('../utils/redis.cache');
const validator = require('validator');
const crypto = require('crypto');
const { createSendToken } = require('../utils/jwt');

// const createSendToken = (user, statusCode, res) => {
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN
//     });

//     const cookieOptions = {
//         expires: new Date(
//             Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//         ),
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production'
//     };

//     res.cookie('jwt', token, cookieOptions);

//     // Removing password from the output
//     user.pssword = undefined;

//     res.status(statusCode).json({
//         status: 'success',
//         token,
//         data: {
//             user
//         }
//     });
// };

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, passwordConfirm, phone } = req.body;

        // checking if password match
        if (password !== passwordConfirm) {
            return next(new AppError('Password do not match', 400));

        // Create user
        const newUser = await User.create({
            name,
            email,
            password,
            passwordConfirm,
            phone
        });
        
        // Send welcoming email (optional)
        // const url = `${req.protocol}://${req.get('host)}/me`;
        // await new Email(newUser, url).sendWelcome();

        // Log user in, send JWT
        createSendToken(newUser, 200, res);

        
        }
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        let { email, password } = req.body;

        // check if email and passowrd exist
        if (!email ||!password) {
            return next(new AppError('Please provide email and password', 400));
        }
        
        if ( typeof email !== 'string') {
            return next(new AppError('Invalid email format', 400));
        }

        // Whitelisting only letters, numbers, underscore, @, dot and hyphen
        // then normalize to lowercase and trim white space
        const sanitizedEmail = email
           .trim()
           .toLowerCase()
           .replace(/[^\w@.-]/g, '');

        // Quick type-check + format-check on email
        if ( !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(sanitizedEmail)) {
            return next(new AppError('Invalid email format', 400));
        }

        // Check if user exists && password is correct
        const user = await User.findOne(
        { email: {$eq: sanitizedEmail } }, //Explicit equality operator
        { email: 1, password: 1, salt: 1 } //Explicit projection
        ).select('+password');
        
        // password validation
        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError('Incorect email or password'));
        }

        // If everything is okay send token to client
        createSendToken(user, 200, res);
    } catch(error) {
        next(error);
    }
};

exports.refreshToken = async (req, res, next) => {
    try {
        // get the refresh token froom cookie or body
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return next(new AppError('No refresh token provided', 401));
        }

        // Verify token
        const decode = await promisify(JsonWebTokenError.verify)(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        // check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next(new AppError('User recently changed password! Please login again', 401));
        }

        // Creata a new access token
        const accessToken = signToken(currentUser._id);

        res.status(200).json({
            status: 'success',
            accessToken
        });
    } catch (error) {
        next(error)
    }
}

exports.logout = async (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: success });
};

exports.forgotPassword = async (req, res, next) => {
    try {
        // get user based on POSTed email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return next(new AppError('There is no user with that email address', 404));
        }

        // generate a random reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // send it to user's email
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Your password reset token (valid for 10 minutes)',
                message: `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nif you did not forget your password, please igonre this emaul!`
            });

            res.status(200).json({
                status: 'success',
                message: 'Token sent to email'
            });
        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return next(new AppError('There was an error sending the email. Try again later!', 500));
        }
    } catch (error) {
        next(error)
    }
}; 

exports.resetPassword = async (req, res, next) => {
    try {
        // validate token exists and is in correct format (64 hex chars)
        const { token } = req.params;

        // 
        if (!token || typeof token !== 'string' ) {
            return next(new AppError('Invalid or malformed token', 400));
        }

        // Remove any unexpected characters from token (should be 64 hex chars)
        const sanitizedToken = token
              .replace(/[^a-f0-9]/gi, '') // Only keep hex characters
              .substring(0, 64); //Ensure exactly 64 characters

        if (sanitizedToken.length !== 64) {
            return next(new AppError('Invalid token fromat', 400));
        }
        
        // Hashing the sanitized token
        const hashedToken = crypto
              .createHash('sha256')
              .update(sanitizedToken)
              .digest('hex')
        
        // Find user with token and check expiration
        const user = await User.findOne(
          {
            passwordResetToken: { $eq: hashedToken },
            passwordResetExpires: { $gt: Date.now() }
        }, {
            passwodResetToken: 1,
            passwordResetExpires: 1,
            emil: 1 
        }
    );
        
        // if token has not expired, and there is user, set the password
        if (!user) {
            return next(new AppError('Token is invalid or has expired', 400))
        }

        // sanitize and validate new password
        const { password, passwordConfirm} = req.body;

        if (!password || passwordConfirm) {
            return next(new AppError('Please provide a new password and a password confirmation', 400));
        }

        // Trim and sanitize passwords
        const sanitizedPassword = password.trim();
        const sanitizedPasswordConfirm = passwordConfirm.trim();

        // Validate password meets requirements
        if (!validator.isStrongPassword(sanitizedPassword, sanitizedPasswordConfirm)) {
            return next(new AppError('Password do not match', 400));
        }

        // Optional: Add stronger password validation
        if (!validator.isStrongPassword(sanitizedPassword, {
            minLength: 8,
            minLowerCase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })) {
            return next(new AppError(
                'Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 symbol',

                400
            ))
        };

        user.password = sanitizedPassword;
        user.passwordConfirm = sanitizedPasswordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // update changedPasswordAt property fro the user
        // This is handled in the user model with a pre-save middleware

        // Log for the user, send JWT
        createSendToken(user, 200, res);

    } catch (error) {
        next(error);
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        // Get user from collection
        const user = await User.findById(req.user.id).select('+password');

        // check if POSTed current password is correct
        if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
            return next(new AppError('Your current password is wrong', 401));
        }

        // If so, update password
        user.password = req.body.newPassword;
        user.passwordConfirm = req.body.newPasswordConfirm;
        await user.save();

        // log user in, send JWT
        createSendToken(user, 200, res);

    } catch (error) {
        next(error);
    }
};
