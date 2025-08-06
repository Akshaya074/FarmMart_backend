

const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  // Extract token from Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  // If no token is provided, return unauthorized
  if (!token) {
    return res.status(401).json({ message: "Unauthorized access: No token provided" });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user information to the request object
    req.user = decoded;

    // Proceed to the next middleware or route
    next();
  } catch (error) {
    // Handle invalid or expired token
    res.status(403).json({ message: "Invalid or expired token", error: error.message });
  }
};

module.exports = authMiddleware;

