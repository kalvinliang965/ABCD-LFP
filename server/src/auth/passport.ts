import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../db/models/User";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if emails array is present and has at least one email
        const email = profile.emails && profile.emails.length > 0 
          ? profile.emails[0].value 
          : undefined;

        // If no email is found, return an error
        if (!email) {
          return done(new Error("No email found in Google profile"), false);
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        // If not, create a new user
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email,
            name: profile.displayName,
            scenarios: [],
            yamlFiles: []
          });
        } else if (!user.googleId) {
          // If user exists but doesn't have a googleId, update it
          user.googleId = profile.id;
          await user.save();
        }

        done(null, user);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
}); 