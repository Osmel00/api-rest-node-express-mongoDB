const User = require("../models/User");
const Song = require("../models/Songs");
const { v4: uuidv4 } = require("uuid");

const userAllSongs = async (req, res) => {
  try {
    const { userId, activeSong: data } = req.body;
    const { key } = data;
    let song = await Song.findOneAndUpdate(
      { key },
      {
        $addToSet: { users: userId },
      }
    ).exec();

    if (!song) {
      song = new Song({ _id: uuidv4(), key, data, users: userId });
      await song.save();
    }

    await User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { songs: song._id } }
    ).exec();

    return res.json({ message: "Song Successfully in Mongodb" });
  } catch (error) {
    console.log(error);
  }
};

const getAllSongs = async (req, res) => {
  const id = req.params.id;
  const user = await User.find({ _id: id })
    .populate("songs", { data: 1, _id: 0 })
    .exec();
  const data = user[0]?.songs?.map((s) => s.data);
  res.json({ data });
};

const removeSongsLiked = async (req, res) => {
  const { id, songKey } = req.body;

  try {
    const song = await Song.findOneAndUpdate(
      { key: songKey },
      { $pull: { users: id } }
    ).exec();
    await User.findOneAndUpdate(
      { _id: id },
      { $pull: { songs: song._id } }
    ).exec();
  } catch (error) {
    console.log(error);
  }
  res.json({ Ok: true, user: id, key: songKey });
};

module.exports = {
  userAllSongs,
  getAllSongs,
  removeSongsLiked,
};
