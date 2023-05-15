const express = require("express");
const passport = require("passport");
const routers = express.Router();
const dotenv = require("dotenv");
const authController = require("../controllers/authController");
const songsController = require("../controllers/songsController");
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

//***************************TEST LOCAL */

routers.post("/login", authController.loginValidation, authController.login);

routers.get("/user", authController.requireToken, (req, res) => {
  res.json(req.user);
});

routers.post(
  "/signup",
  authController.registerValidation,
  authController.signup
);

//******LOCAL_STRATEGY*************************************//
// routers.post("/login", (req, res, next) => {
//   passport.authenticate("login", (err, user, info) => {

//     if (err) next(err);
//     if (!user) return res.send(info);
//     else {

//         req.login(user, (err) => {
//         if (err) next(err);

//         const body = { id: user._id, name: user.name };
//         const token = jwt.sign({ user: body }, process.env.JWT_PRIVATE_KEY); // { expiresIn: '1h' } si quieres que expire
//         res.send({
//           message: "Successfully Authenticated ",
//           token,
//           profile:{displayName:user.name,provider:'Local'}
//         });

//       });
//     }
//   })(req, res, next);
// });

// routers.post("/signup", authController.registerValidation, (req, res, next) => {
//   passport.authenticate("signup", (err, user, info) => {
//     if (err) throw err;
//     if (!user) return res.send(info);
//     else {
//       res.send({ message: "Successfully Registered" });
//     }
//   })(req, res, next);
// });

// routers.get("/profile", (req, res, next) => {
//   passport.authenticate("jwt", (err, user, info) => {
//     //console.log(user);
//     if (!user) return res.send({ Error: info });

//     res.json({
//       message: "You did it",
//       id: user.id,
//       name: user.name,
//       email: user.email,
//     });
//   })(req, res, next);
// });

routers.get("/login/failure", authController.loginFailure);

routers.get("/login/success", authController.loginSuccess);

routers.get("/logout", authController.logout);

routers.post("/songs",songsController.userAllSongs);

 routers.get("/songs/:id",songsController.getAllSongs)

module.exports = routers;
