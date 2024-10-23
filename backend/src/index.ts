import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors'

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// io.on('connection', (socket) => { 
//     console.log('A user connected: ', socket.id);

//     socket.on('disconnect', () => { 
//         console.log('A user disconnected: ', socket.id);
//     })
// })

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Relay the offer to the other peer
  socket.on('offer', (offer) => {
    socket.broadcast.emit('offer', offer);
  });

  // Relay the answer to the other peer
  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  // Relay ICE candidates
  socket.on('ice-candidate', (candidate) => {
    socket.broadcast.emit('ice-candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});