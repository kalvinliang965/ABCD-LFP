import express from "express";
import passport from "passport";
import { client_confg } from "../config/client";
import { login, signup } from '../controllers/authController';

const router = express.Router();

// Add traditional login/signup routes
router.post('/login', login);
router.post('/signup', signup);

// Google OAuth login route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true,
  }),
  (req, res) => {
    // Successful authentication, redirect to frontend callback
    console.log("Google auth successful, redirecting to frontend");
    res.redirect(`${process.env.CLIENT_URL}/auth/callback`);
  }
);

// Logout route
router.get("/logout", (req, res) => {
  if (req.logout) {
    req.logout((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

// Check if user is authenticated
router.get("/current-user", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json(req.user);
});

export default router; 