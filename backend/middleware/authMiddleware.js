const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract the token from the Authorization header

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' }); // Handle missing token
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach the decoded user data to the request
    console.log("Authenticated user:", req.user); // Log user to verify
    next(); // Call the next middleware or route handler
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ msg: 'Token is not valid' }); // Handle invalid token
  }
};

module.exports = authMiddleware;
