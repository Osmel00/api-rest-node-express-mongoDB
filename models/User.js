const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const userSchema = new Schema(
  {
    _id: {
      type: "String",
      require: true,
      unique: true,
    },
    email: {
      type: "String",
      require: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: "String",
      require: true,
      trim: true,
    },
    password: {
      type: "String",
      require: true,
    },
    imageUrl: {
      type: "String",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
module.exports = model('user',userSchema);
