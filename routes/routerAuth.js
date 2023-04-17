const express = require("express");
const passport = require("passport");
const routers = express.Router();
const dotenv = require("dotenv");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const jwt = require('jsonwebtoken');
dotenv.config();

//******GOOGLE_ROUTES****************************************//
routers.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

routers.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login/failure",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect(process.env.CLIENT_API);
  }
);

/*//  routers.get("/Logout", (req, res) => {
//   req.logOut(function (err) {
//     if (err) {
//       return next(err);
//     }
//     req.session.destroy();

//    //res.redirect('http://localhost:3000');

//   });

//   //req.session.sid= null;
//   res.send('Goodbye');
// });*/

//******GITHUB_STRATEGY**********************************//
routers.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

routers.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login/failure" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect(process.env.CLIENT_API);
  }
);

//******LOCAL_STRATEGY*************************************//
routers.post(
  "/login",
  [
    body("email", "A valid email is required").trim().isEmail(),
    body("password", "password required").trim().notEmpty(),
  ],
  authController.loginRegisterValidation,
  (req, res, next) => {
    passport.authenticate("login", (err, user, info) => {
      if (err) next(err);
      if (!user) return res.send(info);
      else {
        req.login(user, (err) => {
          if (err) next(err);
          console.log(user);
          const body = {id:user._id,name:user.name}
          console.log(body);
          const token = jwt.sign(body,process.env.JWT_PRIVATE_KEY)// { expiresIn: '1h' } si quieres que expire

          return res.send({ message: "Successfully Authenticated " ,
        token});
          //aqui desencripto el token
        });
      }
    })(req, res, next);
  }
);

routers.post(
  "/signup",
  [
    body("email", "A valid email is required").trim().isEmail(),
    body("password", "password required").trim().notEmpty(),
    body("name", "name required").trim().notEmpty(),
  ],
  authController.loginRegisterValidation,
  (req, res, next) => {
    passport.authenticate("signup", (err, user, info) => {
      console.log(info);
      if (err) throw err;
      if (!user) return res.send(info);
      else {
        res.send({ message: "Successfully Registered" });
      }
    })(req, res, next);
  }
);

routers.get("/profile",passport.authenticate('jwt',{session:false}),(req, res, next) => {
   res.json({
     message:'You did it',
    _id: req.body.id,
    name:req.body.name,
    token: req.query.secret_token,
    })
})

routers.get("/login", (req, res) => {
  console.log(req.user);
  res.send(req.user);
  next();
});

routers.get("/login/failure", authController.loginFailure);

routers.get("/login/success", authController.loginSuccess);

routers.get("/logout", authController.logout);

module.exports = routers;
