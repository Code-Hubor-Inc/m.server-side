// auth.middleware.js
const jwt = require('jsonwebtoken');
 
const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded; //Attach user info to request object
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
 
// Restrict access to certain roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles || !roles.some(role => req.user.roles.includes(role))) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    next();
  }
}
 
module.exports = { authMiddleware, restrictTo };