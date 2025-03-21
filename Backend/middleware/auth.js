const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Auth middleware - Token received:', token);
  if (!token) return res.status(401).json({ error: 'Authentification requise' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ error: 'Token invalide' });
  }
};

exports.checkRole = (roles) => (req, res, next) => {
  if (!req.user.role || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès interdit' });
  }
  next();
};