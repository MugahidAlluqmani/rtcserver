import express from "express";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let clients = new Map();

wss.on("connection", (ws) => {
  console.log("🔗 New client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("📩 Received:", data);

      // تسجيل المستخدم
      if (data.type === "register") {
        clients.set(data.name, ws);
        ws.name = data.name;
        console.log(`✅ Registered user: ${data.name}`);
        return;
      }

      // إرسال الرسائل للطرف الآخر
      if (data.target && clients.has(data.target)) {
        const target = clients.get(data.target);
        target.send(JSON.stringify({ ...data, from: ws.name }));
        console.log(`📤 Sent message to ${data.target}`);
      }
    } catch (err) {
      console.error("❌ Error parsing message:", err);
    }
  });

  ws.on("close", () => {
    if (ws.name) {
      clients.delete(ws.name);
      console.log(`❌ ${ws.name} disconnected`);
    }
  });
});

app.get("/", (req, res) => {
  res.send("✅ Simple WebRTC Signaling Server is running!");
});

// Use Railway or Render default port, fallback to 3000 for local
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});