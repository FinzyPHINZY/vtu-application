import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import rateLimit from 'express-rate-limit';
import { AllowedIPs } from './constants.js';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';

dotenv.config({});

export const requestLogger = (req, res, next) => {
  console.log('Method: ', req.method);
  console.log('Path: ', req.path);
  console.log('Body: ', req.body);
  console.log('...');
  next();
};

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.userId = decoded.id;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    next(error);
  }
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

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    statusCode: 429,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many OTP requests. Please try again after a minute.',
  },
});

export const ipWhitelistMiddleware = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  if (AllowedIPs.includes(clientIP)) {
    return next();
  }

  return res.status(403).json({
    statusCode: 403,
    message: 'Forbidden: Your IP is not allowed to access this resource.',
  });
};

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

export const validateHeaders = (req, res, next) => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid Authorization header',
    });
    // throw new Error('Missing or invalid Authorization header');
  }

  // Check Content-Type header
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(400).json({
      success: false,
      message: 'Content-Type must be application/json',
    });
    // throw new Error('Content-Type must be application/json');
  }

  // Check ClientID header
  const clientId = req.headers.clientid;
  console.log(clientId, process.env.SAFE_HAVEN_CLIENT_IBS_ID);
  if (!clientId || clientId !== process.env.SAFE_HAVEN_CLIENT_IBS_ID) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ClientID header',
    });
    // throw new Error('Invalid ClientID header');
  }

  next();
};
