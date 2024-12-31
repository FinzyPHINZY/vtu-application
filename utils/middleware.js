import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const requestLogger = (req, res, next) => {
  console.log('Method: ', req.method);
  console.log('Path: ', req.path);
  console.log('Body: ', req.body);
  console.log('...');
  next();
};

export const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');

  if (authorization && authorization.startsWith('Bearer ')) {
    req.token = authorization.replace('Bearer ', '');
  } else {
    req.token = null;
  }

  next();
};

export const userExtractor = async (req, res, next) => {
  const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);

  if (!decodedToken.id) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  const user = await User.findById({ _id: decodedToken.id });

  if (user) {
    req.user = user;
  } else {
    req.user = null;
  }

  next();
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};
