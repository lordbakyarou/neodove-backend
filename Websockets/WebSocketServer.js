const WebSocket = require("ws");
const { SendMessage } = require("../Models/MessageModel");

const clients = new Map(); // Map to store userId and corresponding WebSocket connection

function createWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", function connection(ws, req) {
    const userId = new URLSearchParams(req.url.split("?")[1]).get("userId"); // Use URLSearchParams for better parsing
    console.log("New connection from user:", userId);

    if (userId) {
      clients.set(userId, ws);

      ws.on("message", async function incoming(message) {
        const parsedMessage = JSON.parse(message);
        const { type, recipientId, text } = parsedMessage;
        console.log("Received message:", { userId, recipientId, text });

        if (type === "private_message" && recipientId && text) {
          const recipientWs = clients.get(recipientId);
          console.log("Recipient WebSocket and clients map:", {
            recipientWs,
            clients,
          });

          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            const data = await SendMessage({
              senderId: userId,
              receiverId: recipientId,
              message: text,
            });
            console.log("Message saved and sent:", data);
            recipientWs.send(JSON.stringify(data));
          } else {
            console.log(
              `Recipient WebSocket not open or not found for userId: ${recipientId}`
            );
          }
        }
      });

      ws.on("close", () => {
        clients.delete(userId);
        console.log(`Connection closed and removed for user: ${userId}`);
      });

      ws.on("error", (error) => {
        console.error(`WebSocket error for user: ${userId}`, error);
      });
    } else {
      ws.close();
      console.log("Connection closed due to missing userId");
    }
  });

  return wss;
}

module.exports = createWebSocketServer;
