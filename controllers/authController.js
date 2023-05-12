const { validationResult, cookie } = require("express-validator");
const { body } = require("express-validator");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
dotenv.config();

const validator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ Errors: errors.array() });
  }
  next();
};
const loginValidation = [
  body("email", "A valid email is required").trim().isEmail(),
  body("password", "password required").trim().notEmpty(),
  validator,
];

const registerValidation = [
  body("email", "A valid email is required").trim().isEmail(),
  body("password", "password required").trim().notEmpty(),
  body("name", "name required").trim().notEmpty(),
  validator,
];

///********** Middlewares ********************************/

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email }).exec();

    if (!user) return res.status(403).json({ Error: "User is not registered" });

    const responsePassword = await user.comparePassword(password);
    if (!responsePassword)
      return res.status(403).json({ Error: "Password is not valid" });

    //create Token
    const body = { email: user.email, name: user.name };
    const token = jwt.sign({ user: body }, process.env.JWT_PRIVATE_KEY); // { expiresIn: '1h' } si quieres que expire

    res
      .cookie("token", token, {
        httpOnly: true,
        //secure: true//*mode production
      })
      .json({
        token: token,
        message: "Successfully authentication",
      });

    next();
  } catch (error) {
    console.log(error);
  }
};

const requireToken = (req, res, next) => {
  const token = req.cookies.token; //* la cookie por fin

  if (!token)
    return res.status(401).json({ Error: "Token not found, access denied" });

  jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, user) => {
    if (err)
      return res
        .status(401)
        .json({ Error: "Access denied ,token expired or invalid" });
    req.user = user;

    next();
  });
};

const signup = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    let user = await User.findOne({ email }).exec();
    if (user) return res.json({ Error: "User already registered" });

    user = new User({ _id: uuidv4(), email, name, password });
    await user.save();
    return res.json({ message: "Successfully Registered" });
  } catch (error) {
    console.log(error);
  }
};
const loginSuccess = (req, res) => {
  
  if (req.user) {
    res.status(200).json({
      user: {
        id:req.user.socialUser.id,
        name: req.user.socialUser.name,
        email: req.user.socialUser.email,
        provider: req.user.socialUser.provider,
      },
    });
    //console.log(req.session);
  } else {
    res.json({ Error: true, message: "User not found" });
  }
};

const logout = (req, res) => {
  if (req.cookies) {
    req.session.destroy();
    res.clearCookie("connect.sid"); // clean up!
    res.clearCookie("token");

    return res.json({ msg: "Logging you out" });
  } else {
    return res.json({ msg: "no user to log out!" });
  }
};

const loginFailure = (req, res) => {
  res.status(401).json({
    messagge: "something went wrong...",
  });
};

module.exports = {
  loginSuccess,
  logout,
  loginFailure,
  login,
  requireToken,
  signup,
  loginValidation,
  registerValidation,
};
