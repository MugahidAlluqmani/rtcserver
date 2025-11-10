const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const users = {}; // { username: socket.id }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', ({ username }) => {
    users[username] = socket.id;
    console.log(`User registered: ${username} (${socket.id})`);
  });

  socket.on('offer', ({ to, offer }) => {
    const targetId = users[to];
    if (targetId) io.to(targetId).emit('offer', { from: socket.id, offer });
  });

  socket.on('answer', ({ to, answer }) => {
    const targetId = users[to];
    if (targetId) io.to(targetId).emit('answer', { from: socket.id, answer });
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    const targetId = users[to];
    if (targetId) io.to(targetId).emit('ice-candidate', { from: socket.id, candidate });
  });

  socket.on('disconnect', () => {
    for (const [name, id] of Object.entries(users)) {
      if (id === socket.id) {
        delete users[name];
        console.log(`User disconnected: ${name}`);
        break;
      }
    }
  });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('🚀 Signaling server running on port '+PORT));

