const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
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
      callbackURL: "/api/v1/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, done) {
      const { id, displayName: name, emails, provider } = profile;
      let user = await User.findOne({ _id: id }).exec();

      if (!user) {
        user = new User({ _id: id, email: emails[0].value, name });
        await user.save();
      }

      return done(null, {
        token: accessToken,
        socialUser: {
          id,
          name,
          email: emails[0].value,
          provider,
        },
      });
    }
  )
);

//******GITHUB_STRATEGY**********************************//
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/github/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      const { id, username: name, provider } = profile;
      let user = await User.findOne({ _id: id }).exec();

      if (!user) {
        user = new User({ _id: id, email:`${name}@github.com`, name });
        await user.save();
      }
      console.log(profile);
      return done(null, {
        token: accessToken,
        socialUser: {
          id,
          name,
          provider,
        },
      });
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
      //session: false,
    },

    async function (req, email, password, done) {
      try {
        let user = await User.findOne({ email }).exec();
        if (user)
          return done(null, false, { Error: "User already registered" });

        const name = req.body.name;
        user = new User({ _id: uuidv4(), email, name, password });
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
      //passReqToCallback: true, //*estos es para traer todo lo que viene del usuario en el body
      //session: true,
    },

    async function (email, password, done) {
      try {
        let user = await User.findOne({ email }).exec();

        if (!user) done(null, false, { Error: "User is not registered" });

        const responsePassword = await user.comparePassword(password);
        if (!responsePassword) {
          done(null, false, { Error: "Password is not valid" });
        }
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

//******JWT_TOKEN_STRATEGY*************************************//
var opts = {};
//opts.jwtFromRequest = ExtractJwt.fromUrlQueryParameter('secret_token');
opts.jwtFromRequest = ExtractJwt.fromBodyField("secretToken");
opts.secretOrKey = process.env.JWT_PRIVATE_KEY;
//opts.secretOrKey = process.env.JWT_PRIVATE_KEY;

passport.use(
  "jwt",
  new JwtStrategy(opts, async function (token, done) {
    try {
      const id = token.user.id;
      let user = await User.findById(id).exec();
      if (user)
        return done(null, { id: user.id, name: user.name, email: user.email });
      return done(null, false, { Error: "User Unauthorized" });
    } catch (error) {
      done(error);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
