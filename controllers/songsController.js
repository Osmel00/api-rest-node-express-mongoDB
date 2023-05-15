const User = require("../models/User");
const Song = require("../models/Songs");
const { v4: uuidv4 } = require("uuid");


const userAllSongs = async (req, res) => {
  try {
    const { userId, activeSong: data } = req.body;
    console.log('body',userId);
    const { key } = data;
    let song = await Song.findOneAndUpdate(
      { key },
      {
        $addToSet: { users: userId },
      }
    ).exec();

    if (!song) {
      console.log('!song',userId);
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
     const user = await User.find({_id:id}).populate("songs",{data:1,_id:0}).exec();
     const data = user[0]; 
     res.json({ OK: true, data});
};

module.exports = {
  userAllSongs,
  getAllSongs,
};
