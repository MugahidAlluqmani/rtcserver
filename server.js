const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let users = {}; // name -> socket.id

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // تسجيل اسم المستخدم
  socket.on('register', (username) => {
    users[username] = socket.id;
    console.log(`✅ ${username} registered as ${socket.id}`);
  });

  // إرسال عرض لشخص محدد
  socket.on('offer', ({ target, offer }) => {
    const targetId = users[target];
    if (targetId) io.to(targetId).emit('offer', { offer, from: socket.id });
  });

  // إرسال جواب للشخص الذي أرسل العرض
  socket.on('answer', ({ target, answer }) => {
    io.to(target).emit('answer', { answer });
  });

  // تبادل مرشحات ICE
  socket.on('ice-candidate', ({ target, candidate }) => {
    io.to(target).emit('ice-candidate', { candidate });
  });

  // عند قطع الاتصال
  socket.on('disconnect', () => {
    for (let name in users) {
      if (users[name] === socket.id) delete users[name];
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(8080, () => console.log('🚀 Signaling server running on port 8080'));