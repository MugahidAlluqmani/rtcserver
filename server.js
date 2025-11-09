const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// عندما يتصل أحد المستخدمين
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // استقبال الـ Offer وإرساله للطرف الآخر
  socket.on('offer', (data) => {
    socket.broadcast.emit('offer', data);
  });

  // استقبال الـ Answer وإرساله للطرف الآخر
  socket.on('answer', (data) => {
    socket.broadcast.emit('answer', data);
  });

  // استقبال الـ ICE Candidate وإرساله للطرف الآخر
  socket.on('ice-candidate', (data) => {
    socket.broadcast.emit('ice-candidate', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 🟢 استخدم المنفذ الذي توفره Railway
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on port ${PORT}`);
});

// (اختياري) صفحة اختبار
app.get('/', (req, res) => {
  res.send('✅ WebRTC Signaling Server is running');
});