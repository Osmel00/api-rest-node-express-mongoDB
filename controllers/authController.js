const { validationResult } = require("express-validator");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");


const isLoginSuccess = async (req, res, next) => {
  const { email, passwd:password } = req.body;
  try {
      const user = await User.findOne({ email }).exec();
      //console.log(user);
     if (!user) {
        return res.status(409).json({ Error: "User is not registered" });
      }

      const responsePassword = await user.comparePassword(password);
      console.log(responsePassword);
      if (!responsePassword) {
         return res.status(409).json({ Error: "Password is not valid" });
        }
      next();
    } catch (error) {
      return res.status(500).json({ Error: error })
  }
}
const isRegisteredSuccess = async (req, res, next) => {
  const { email, passwd:password, name } = req.body;

  try {
    let user = await User.findOne({email}).exec();
    console.log(user);
    if (user) return res.status(409).json({ Error: "User already registered" });

    user = new User({ _id: uuidv4(), email, password, name });
    await user.save();
    ///*** send the jwt token
     
    next();
  } catch (error) {
    return res.status(500).json({ Error: error });
  }
};

const loginRegisterValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ Errors: errors.array() });
  }
  next();
};

const loginSuccess = (req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(403).json({ error: true, message: "User not found" });
  }
};

const logout = (req, res) => {
  if (req.user) {
    req.session.destroy();
    res.clearCookie("connect.sid"); // clean up!
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
  loginRegisterValidation,
  isRegisteredSuccess,
  isLoginSuccess
};

//new