const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const songSchema = new Schema({
  _id: {
    type: "String",
  },

  key: {
    type: "String",
    required: true,
    trim: true,
    unique: true,
  },

  data:{},
  users: [{ type: Schema.Types.String, ref: "User" }],
},
{
  timestamps: true,
  versionKey: false,
}

);

module.exports = model("Song", songSchema);
