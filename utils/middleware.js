import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import rateLimit from 'express-rate-limit';
// import { AllowedIPs } from './constants.js';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({});

export const requestLogger = (req, res, next) => {
  console.log('Method: ', req.method);
  console.log('Path: ', req.path);
  console.log('Body: ', req.body);
  console.log('...');
  next();
};

export const convertAccessTokenToIdToken = async (req, res, next) => {
  try {
    const { access_token } = req.body.idToken; // This is actually the access token

    if (!access_token) {
      return res.status(400).json({ message: 'Access Token required' });
    }

    // Fetch user info using the access token
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`
    );

    if (!response.data.email) {
      return res.status(400).json({ message: 'Invalid Google Access Token' });
    }

    // Attach the user info to the request
    req.user = {
      email: response.data.email,
      googleId: response.data.sub,
    };

    next(); // Proceed to the actual authentication controller
  } catch (error) {
    console.error(
      'Token conversion error:',
      error?.response?.data || error.message
    );
    return res.status(401).json({ message: 'Invalid Google Access Token' });
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
  console.log('JWT', req.token, process.env.JWT_SECRET);
  const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);

  if (!decodedToken.id) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  const user = await User.findById({ _id: decodedToken.id });

  if (user) {
    req.user = { user, ...decodedToken };
  } else {
    req.user = null;
  }

  next();
};

export const fetchAccessToken = async (req, res, next) => {
  try {
    const CLIENT_ID = process.env.SAFE_HAVEN_CLIENT_ID;
    const CLIENT_ASSERTION = process.env.SAFE_HAVEN_CLIENT_ASSERTION;

    const body = {
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_assertion: CLIENT_ASSERTION,
      client_assertion_type:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    };

    console.log('Fetching Safe Haven Access Token...');
    const response = await axios.post(
      `${process.env.SAFE_HAVEN_API_BASE_URL}/oauth2/token`,
      body
    );

    const { access_token, expires_in, ibs_client_id } = response.data;

    console.log('Access Token fetched:', access_token);

    // Attach the token and related details to the req object
    req.accessToken = {
      access_token,
      expires_in,
      ibs_client_id,
    };

    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    console.error(
      'Error fetching access token:',
      error.response?.data || error.message
    );
    return res.status(500).json;
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.user.role;

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

// export const ipWhitelistMiddleware = (req, res, next) => {
//   const clientIP = req.ip || req.connection.remoteAddress;

//   if (AllowedIPs.includes(clientIP)) {
//     return next();
//   }

//   return res.status(403).json({
//     statusCode: 403,
//     message: 'Forbidden: Your IP is not allowed to access this resource.',
//   });
// };

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
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

  next();
};

export const pinAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: {
    success: false,
    message: 'Too many PIN attempts, please try again later',
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
  },
});
