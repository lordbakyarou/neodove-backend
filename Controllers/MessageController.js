const express = require("express");
const { CheckIfUserExist } = require("../Models/UserModel");
const MessageSchema = require("../Schema/MessageSchema");
const { validateMessage } = require("../Utils/MessageUtils");
const { SendMessage, GetMessages } = require("../Models/MessageModel");
const UserSchema = require("../Schema/UserSchema");

const MessageRouter = express.Router();

MessageRouter.post("/send-message", async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  try {
    //Validation of message
    validateMessage({ senderId, receiverId, message });

    // console.log(senderId, receiverId);

    //Validating users
    await CheckIfUserExist({ userId: senderId });
    await CheckIfUserExist({ userId: receiverId });

    // return res.status(200).json("messageObject");
    // await SendMessage({
    //   senderId,
    //   receiverId,
    //   message,
    // });

    return res.status(200).json("Message sent");
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});

MessageRouter.get("/get-all-message/:sid/:rid", async (req, res) => {
  const { sid, rid } = req.params;

  try {
    await CheckIfUserExist({ userId: sid });
    await CheckIfUserExist({ userId: rid });

    const messages = await GetMessages({ sid, rid });

    return res.send(messages);
  } catch (error) {
    console.log(error);
    return res.status(error.status).json(error.message);
  }
});

module.exports = MessageRouter;
