import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../db/models/User";

// This is called when user logs in
passport.serializeUser((user: any, done) => {
  //console.log("Serializing user with ID:", user._id);
  // Store only the user ID in the session
  done(null, user._id.toString());
});

// This is called on every request to get the user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    //console.log("Deserializing user with ID:", id);
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error("Error deserializing user:", error);
    done(error, null);
  }
});

// Google strategy configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: "/auth/google/callback",
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        //console.log("Google profile:", profile.id);
        
        // Check if user already exists
        const existingUser = await User.findOne({ googleId: profile.id });
        
        if (existingUser) {
         // console.log("Existing user found:", existingUser._id);
          return done(null, existingUser);
        }
        
        // Create new user
        //console.log("Creating new user...");
        const newUser = new User({
          userId: `user_${Math.random().toString(36).substr(2, 9)}`,
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value || '',
          profilePicture: profile.photos?.[0]?.value || ''
        });
        
        // Save user to database
        await newUser.save();
        //console.log("New user saved with ID:", newUser._id);
        
        // Return the new user
        done(null, newUser);
      } catch (error) {
        console.error("Error in Google strategy:", error);
        done(error, false);
      }
    }
  )
);

export default passport; 