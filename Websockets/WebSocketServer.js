const { parse } = require("dotenv");
const WebSocket = require("ws");

const clients = new Map(); // Map to store userId and corresponding WebSocket connection

function createWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", function connection(ws, req) {
    const userId = req.url.split("/?userId=")[1]; // Implement this function based on your auth strategy

    // Add user to clients map
    clients.set(userId, ws);

    ws.on("message", function incoming(message) {
      const parsedMessage = JSON.parse(message);
      const { type, recipientId, text } = parsedMessage;

      if (type === "private_message" && recipientId && text) {
        const recipientWs = clients.get(recipientId);
        if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
          recipientWs.send(JSON.stringify({ senderId: userId, text }));
        }
      }
    });

    ws.on("close", () => {
      clients.delete(userId);
    });
  });

  return wss;
}

module.exports = createWebSocketServer;
