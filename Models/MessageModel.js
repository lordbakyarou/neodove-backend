const MessageSchema = require("../Schema/MessageSchema");

const { MongoClient } = require("mongodb");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

const SendMessage = ({ senderId, receiverId, message }) => {
  return new Promise(async (res, rej) => {
    try {
      const newMessage = await new MessageSchema({
        sender: senderId,
        receiver: receiverId,
        message,
      });

      newMessage.save();

      res(newMessage);
    } catch (error) {
      res(error);
    }
  });
};

const GetMessages = ({ sid, rid }) => {
  return new Promise(async (res, rej) => {
    try {
      const data = await MessageSchema.aggregate([
        {
          $match: {
            $or: [
              {
                sender: new mongoose.Types.ObjectId(sid),
                receiver: new mongoose.Types.ObjectId(rid),
              },
              {
                sender: new mongoose.Types.ObjectId(rid),
                receiver: new mongoose.Types.ObjectId(sid),
              },
            ],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $lookup: {
            from: "users",
            localField: "receiver",
            foreignField: "_id",
            as: "receiverInfo",
          },
        },
      ]);

      if (data.length === 0) res({ message: "No data found", status: 200 });

      res({ message: data, status: 200 });
    } catch (error) {
      rej({ message: error, status: 500 });
    }
  });
};

module.exports = { SendMessage, GetMessages };
