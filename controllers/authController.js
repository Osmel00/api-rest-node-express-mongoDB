const { validationResult } = require("express-validator");
const User = require("../models/User")
const { v4: uuidv4 } = require('uuid')
const isRegisteredSuccess = async (req, res, next) => {
    const {username:email, password,name} = req.body;
    
    try {
      const user = new User({_id:uuidv4(),email, password,name})
      await user.save()
      ///*** send the jwt token
      next();
    } catch (error) {
      console.log(error);
    } 
}
const loginRegisterValidation = (req, res, next) => {
 const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ Errors: errors.array()});
  }
  console.log(req.body);
  
  res.json({ ok: true });//*Este res hay que quitarlo de aqui despues
  next();
};

const loginSuccess = (req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(403).json({ error: true, message: "user not found" });
  }
};

const logout = (req, res) => {
  if (req.user) {
    req.session.destroy();
    res.clearCookie("connect.sid"); // clean up!
    return res.json({ msg: "logging you out" });
  } else {
    return res.json({ msg: "no user to log out!" });
  }
};

const loginFailure = (req, res) => {
  res.status(401).json({
    messagge: "something went wrong...",
  });
};

module.exports = { loginSuccess, logout, loginFailure, loginRegisterValidation,isRegisteredSuccess };
