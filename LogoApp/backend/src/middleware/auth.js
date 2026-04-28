/**
 * Authentication middleware placeholder
 * Future: implement JWT validation here
 * 
 * Usage in routes:
 *   const { authenticate } = require('../middleware/auth');
 *   router.get('/protected', authenticate, controller.getAll);
 */
const authenticate = (req, res, next) => {
  // TODO: Validate JWT token from Authorization header
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) return res.status(401).json({ error: 'Unauthorized' });
  // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { ... })
  
  // For MVP: pass through without authentication
  next();
};

const authorize = (...roles) => (req, res, next) => {
  // TODO: Check req.user.role against allowed roles
  next();
};

module.exports = { authenticate, authorize };
