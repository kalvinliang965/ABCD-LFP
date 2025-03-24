import express from "express";
import passport from "passport";

const router = express.Router();

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
    // Successful authentication, redirect to dashboard on the frontend
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.redirect(`${process.env.CLIENT_URL}/login`);
  });
});

// Check if user is authenticated
router.get("/current-user", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router; 