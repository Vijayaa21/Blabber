import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

export const googleAuth = (req, res, next) => {
  console.log("🔐 Starting Google OAuth flow");
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
};

export const googleCallback = (req, res, next) => {
  console.log("🔄 Google OAuth callback received");
  console.log("📋 Query params:", req.query);
  
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }, (err, user, info) => {
    console.log("🔍 Passport authenticate callback executed");
    console.log("❌ Error:", err);
    console.log("👤 User:", user);
    console.log("ℹ️ Info:", info);
    
    if (err) {
      console.error("🚨 Google OAuth error:", err);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=server_error&details=${encodeURIComponent(err.message)}`);
    }
    
    if (!user) {
      console.error("🚨 No user returned from Google OAuth");
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed&details=no_user`);
    }

    try {
      // Generate JWT token
      const token = generateToken(user._id);
      console.log("✅ JWT token generated for user:", user._id);

      // Set cookie and redirect
      res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
      });

      console.log("✅ Cookie set, redirecting to dashboard");
      res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    } catch (tokenError) {
      console.error("🚨 Token generation error:", tokenError);
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error&details=token_error`);
    }
  })(req, res, next);
};