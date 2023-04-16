const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

//******GOOGLE_STRATEGY****************************************//
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    function (accessToken, refreshToken, profile, done) {
      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });

      return done(null, profile);
    }
  )
);

//******GITHUB_STRATEGY**********************************//
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      // User.findOrCreate({ githubId: profile.id }, function (err, user) {
      //   return done(err, user);
      // });
      return done(null, profile);
    }
  )
);

//******LOCAL_STRATEGY*************************************//
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "passwd",
      passReqToCallback: true, //*estos es para traer todo lo que viene del usuario en el body

      //session: false,
    },

     function (req, email, passwd, done) {
     
      if (email && passwd) {
        const user = {
          email: email,
          password: passwd,
        };

        //console.log(user);
        return done(null, user);
      }

      return done(null, false,{message: 'user not authenticated'});
    }
  )
);

passport.serializeUser(function (user, done) {
  return done(null, user);
});
passport.deserializeUser(function (user, done) {
  return done(null, user);
});
