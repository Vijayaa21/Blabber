import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

console.log("🔧 Initializing Google OAuth Strategy");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL || "http://localhost:5000"}/api/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("👤 Google profile received:", {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value,
        });

        if (!profile.emails || !profile.emails[0]) {
          console.error("🚨 No email found in Google profile");
          return done(new Error("No email found in Google profile"));
        }

        const email = profile.emails[0].value;
        
        // Look for user by Google ID or email
        let user = await User.findOne({ 
          $or: [
            { googleId: profile.id },
            { email: email }
          ]
        });

        if (user) {
          console.log("✅ Existing user found:", user._id);
          
          // Update user with Google ID if not set
          if (!user.googleId) {
            user.googleId = profile.id;
            // Do not overwrite password for existing users when linking Google OAuth
            await user.save();
            console.log("✅ Updated existing user with Google ID");
          }
          return done(null, user);
        } else {
          console.log("🆕 Creating new user from Google profile");
          
          // Create new user with "google" as password
          const username = await generateUniqueUsername(profile.displayName);
          
          user = await User.create({
            googleId: profile.id,
            username: username,
            fullName: profile.displayName,
            email: email,
            password: "google", // Standard string for OAuth users
            profileImg: profile.photos?.[0]?.value || "",
            isAccountVerified: true,
          });

          console.log("✅ New Google OAuth user created:", user._id);
          return done(null, user);
        }
      } catch (error) {
        console.error("🚨 Error in Google Strategy:", error);
        return done(error, null);
      }
    }
  )
);

// Helper function to generate unique username
const generateUniqueUsername = async (displayName) => {
  let baseUsername = displayName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .substring(0, 15);
  
  if (!baseUsername || baseUsername.length < 3) {
    baseUsername = "user";
  }
  
  let username = baseUsername;
  let counter = 1;
  
  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
    if (counter > 100) {
      username = `${baseUsername}${Date.now()}`;
      break;
    }
  }
  
  console.log("🔤 Generated username:", username);
  return username;
}


export default passport;