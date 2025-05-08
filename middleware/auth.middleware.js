/**
 * 
 * auth.middleware.js
 */

// const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');
const AppError = require('../utils/app.error')
const jwt = require('jsonwebtoken');

exports.protect = async(req, res, next) => {
  try {
    let token;

    // safe optional chainign
    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
  } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
  ) {
      token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access', 401));
  }

  // 2) Verify token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
      return next(new AppError('The user belonging to this account no longer exists', 401));
  }

  // 4) Grant access to protected route
  req.user = currentUser;
  next();
} catch (err) {
  next(err);
}
};
    // get token from cookie header
//     let token;
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startWith('Bearer')
//     ) {
//       token = req.headers.authorization.split(' ')[1];
//     } else if (req.cookies.jwt) {
//       token = req.cookies.jwt
//     }

//     if (!token) {
//       return next(new AppError('You are not logged in! Please log in to get access', 401));
//     }

//     const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//     const currentUser = await User.findById(decoded.id);
//     if (!currentUser) {
//       return next(new AppError('User recently changed password! Please login again', 401))
//     }

//     req.user = currentUser;
//     res.locals.user = currentUser;
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// module.exports = router;