const User = require("../models/User");
const Song = require("../models/Songs");
const { v4: uuidv4 } = require("uuid");

const userAllSongs = async (req, res) => {
  try {
    const { userId, activeSong: data } = req.body;
    const { key } = data;
   
    await User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { songs: key } }
    ).exec();
    let song = await Song.findOneAndUpdate(
      { key },
      {
        $addToSet: { users: userId },
      }
    ).exec();
    console.log(song);
    if (song) {
      return res.json({ OK: "Update successfully Mongodb" });
    }

    song = new Song({ _id: uuidv4(), key, data, users: userId });
    await song.save();

    return res.json({ message: "Song Successfully in Mongodb" });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  userAllSongs,
};
