const validateMessage = ({ senderId, receiverId, message }) => {
  return new Promise((res, rej) => {
    if (!message || message.trim().length === 0)
      rej({ status: 400, message: "Cannot send empty message" });

    if (!senderId) rej({ status: 400, message: "Sender Id cannot be empty" });
    if (!receiverId)
      rej({ status: 400, message: "Receiver Id cannot be empty" });
  });
};

module.exports = { validateMessage };
