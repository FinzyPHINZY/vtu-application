import express from 'express';
import passport from 'passport';
import * as OauthController from '../controllers/oauth-google.js';

const router = express.Router();

// route to start oauth flow
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Handling the Google OAuth callback route
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  OauthController.googleCallback
);

// route for app google oauth
router.post('/google/app', OauthController.appLogin);

export default router;
