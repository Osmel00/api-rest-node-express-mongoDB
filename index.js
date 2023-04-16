const cors=require("cors");
const passport = require("passport");
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const session = require('express-session')
require("./passport");
const authRoutes = require("./routes/routerAuth");
const dotenv = require("dotenv"); 
const PORT = process.env.PORT || 6000;
dotenv.config();
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
   
  }))
app.use(cors({
  origin:process.env.CLIENT_API,
  methods: "GET, POST, PUT, DELETE",
  credentials: true, //*********access-control-allow-credentials:true*****///
}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth',authRoutes);


//***************SERVER + MONGODB*********************************//
const bootstrap = async () =>{
  await  mongoose.connect(process.env.MONGODB_URL)
  app.listen(PORT, () => {
    console.log(`Server connected on port ${PORT}`);
  });
}
bootstrap();