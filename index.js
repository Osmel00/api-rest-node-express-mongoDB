const cors = require("cors");
const passport = require("passport");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("./passport");
const authRoutes = require("./routes/routerAuth");
const dotenv = require("dotenv");

//app.use(express.urlencoded({ extended: false }));
const PORT = process.env.PORT || 6000;
dotenv.config();


app.set("trust proxy",1);
app.use(
  session({
    secret: "secretcode",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none",
      //maxAge: 1000 * 60 * 60 * 24 * 7, //One week
    },
  })
);
app.use(
  cors({
    origin: "https://felify-music.vercel.app",
    methods: "GET, POST, PUT, DELETE",
    credentials: true, //*********access-control-allow-credentials:true*****///
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/v1/auth", authRoutes);

//***************SERVER + MONGODB*********************************//
const bootstrap = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  app.listen(PORT, () => {
    console.log(`Server connected on port ${PORT}`);
  });
};
bootstrap();
