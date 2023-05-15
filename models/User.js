const mongoose = require("mongoose");
const { model, Schema } = mongoose;
const bcrypt = require("bcryptjs");
const userSchema = new Schema({
    _id: {
      type: "String",
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
     
    },
    imageUrl: {
      type: "String",
    },
    songs: [{ type: Schema.Types.String, ref: "Song" }]
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  try {
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(user.password, salt);
    next();
  } catch (error) {
    console.log(error);
    throw new Error("Hash password failed: " + error.message);
  }
});

userSchema.methods.comparePassword = async function (frontendPassword) {
  return await bcrypt.compare(frontendPassword, this.password);
};
module.exports = model("User", userSchema);
