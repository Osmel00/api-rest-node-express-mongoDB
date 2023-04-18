const { validationResult } = require("express-validator");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

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
};
