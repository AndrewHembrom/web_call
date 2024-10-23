"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: 'http://localhost:5173' }));
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
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
