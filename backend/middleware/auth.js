const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password'); // fetch user, exclude password field
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    req.user = user; // now any route handler after this can use req.user
    next(); // pass control to the actual route handler
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
}

module.exports = protect;