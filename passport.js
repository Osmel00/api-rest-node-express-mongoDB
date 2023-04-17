const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt  = require("passport-jwt").ExtractJwt;
const dotenv = require("dotenv");
const User = require("./models/User");
const { v4: uuidv4 } = require("uuid");

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
  "signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true, //*estos es para traer todo lo que viene del usuario en el body
      session: false,
    },

    async function (req, email, password, done) {
      try {
        let user = await User.findOne({ email }).exec();
        if (user)
          return done(null, false, { Error: "User already registered" });

        const name = req.name;
        user = new User({ _id: uuidv4(), email, password, name });
        await user.save();
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true, //*estos es para traer todo lo que viene del usuario en el body
      session: false,
    },

    async function (req, email, password, done) {
      try {
        let user = await User.findOne({ email }).exec();
        log
        if (!user)
          return done(null, false, { Error: "User is not registered" });

        const responsePassword = await user.comparePassword(password);
        if (!responsePassword) {
          return done(null, false, { Error: "Password is not valid" });
        }
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

//******JWT_TOKEN_STRATEGY*************************************//
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromUrlQueryParameter('secret_token');
opts.secretOrKey = process.env.JWT_PRIVATE_KEY;

passport.use(
  "jwt",
  new JwtStrategy(opts, async function (token, done) {
    try {
      return done(null, token.body);
    } catch (error) {
      done(error);
    }
  })
);

passport.serializeUser(function (user, done) {
  return done(null, user);
});
passport.deserializeUser(function (user, done) {
  return done(null, user);
});
