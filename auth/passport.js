require("dotenv").config(); // Load environment variables
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const Users = require("../models/users");

passport.use(
  "google-signup",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Use the correct environment variable name
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Use the correct environment variable name
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        console.log('hi this passport')
        const email = profile.emails[0].value;
        const existingUser = await Users.findOne({ email });

        if (existingUser) {
          // Authentication failed due to duplicate email
          return done(null, false, { errmsg: "Duplicate email found." });
        }

        // Create a new user or perform any necessary actions

        // Call done with the user object or an error if applicable
        done(null, profile);
      } catch (err) {
        console.error("Error while authenticating with Google:", err);
        done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
