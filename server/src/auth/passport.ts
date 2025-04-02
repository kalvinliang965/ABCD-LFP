import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../db/models/User";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (error) {
    done(error, false);
  }
});

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
        // Check if user already exists
        const existingUser = await User.findOne({ googleId: profile.id });
        
        if (existingUser) {
          return done(null, existingUser);
        }
        
        // Create new user
        const newUser = new User({
          userId: `user_${Math.random().toString(36).substr(2, 9)}`,
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value || '',
          profilePicture: profile.photos?.[0]?.value || ''
        });
        
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

export default passport; 