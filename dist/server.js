"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
// when using middleware `hostname` and `port` must be provided below
const app = (0, next_1.default)({ dev, hostname, port });
const handler = app.getRequestHandler();
app.prepare().then(() => {
    const httpServer = (0, node_http_1.createServer)(handler);
    const io = new socket_io_1.Server(httpServer);
    const roomNamespace = io.of("/room");
    const waitingUserChat = [];
    const waitingUserVideoChat = [];
    const pairedUser = {};
    // Random chat
    io.on("connection", (socket) => {
        socket.on("find-pair", () => {
            if (waitingUserChat.includes(socket.id) || pairedUser[socket.id]) {
                return;
            }
            let isPaired = false;
            for (let i = 0; i < waitingUserChat.length; i++) {
                const pairedSocketId = waitingUserChat.splice(i, 1)[0];
                pairedUser[socket.id] = pairedSocketId;
                pairedUser[pairedSocketId] = socket.id;
                io.to(socket.id).emit("pair-found");
                io.to(pairedSocketId).emit("pair-found");
                isPaired = true;
                break;
            }
            if (!isPaired) {
                waitingUserChat.push(socket.id);
            }
        });
        socket.on("find-video-pair", () => {
            if (waitingUserVideoChat.includes(socket.id) || pairedUser[socket.id]) {
                return;
            }
            let isPaired = false;
            for (let i = 0; i < waitingUserVideoChat.length; i++) {
                const pairedSocketId = waitingUserVideoChat.splice(i, 1)[0];
                pairedUser[socket.id] = pairedSocketId;
                pairedUser[pairedSocketId] = socket.id;
                io.to(socket.id).emit("pair-found");
                io.to(pairedSocketId).emit("pair-found");
                isPaired = true;
                break;
            }
            if (!isPaired) {
                waitingUserVideoChat.push(socket.id);
            }
        });
        socket.on("exchange-info", (info) => {
            const pairedSocketId = pairedUser[socket.id];
            if (pairedSocketId) {
                io.to(pairedSocketId).emit("receive-info", info);
            }
        });
        socket.on("send-peer-id", (peerId) => {
            const pairedSocketId = pairedUser[socket.id];
            if (pairedSocketId) {
                io.to(pairedSocketId).emit("receive-peer-id", peerId);
            }
        });
        socket.on("send-message", (message) => {
            const pairedSocketId = pairedUser[socket.id];
            if (pairedSocketId) {
                io.to(pairedSocketId).emit("receive-message", message);
            }
        });
        socket.on("disconnect-pair", () => {
            const pairedSocketId = pairedUser[socket.id];
            if (pairedSocketId) {
                io.to(pairedSocketId).emit("pair-disconnected");
                delete pairedUser[socket.id];
                delete pairedUser[pairedSocketId];
            }
        });
        socket.on("disconnect", () => {
            const waitingIndex = waitingUserChat.indexOf(socket.id);
            if (waitingIndex !== -1) {
                waitingUserChat.splice(waitingIndex, 1);
            }
            const pairedSocketId = pairedUser[socket.id];
            if (pairedSocketId) {
                io.to(pairedSocketId).emit("pair-disconnected");
                delete pairedUser[socket.id];
                delete pairedUser[pairedSocketId];
            }
        });
    });
    // Chat rooms
    const roomsUsers = {};
    roomNamespace.on("connection", (socket) => {
        socket.on("join-room", (room, user, cb) => {
            socket.join(room);
            if (!roomsUsers[room]) {
                roomsUsers[room] = {};
            }
            roomsUsers[room][socket.id] = user;
            socket.to(room).emit("user-connected", user);
            socket.nsp.to(room).emit("receive-members", roomsUsers[room]);
            if (cb)
                cb();
        });
        socket.on("send-message", (room, message) => {
            if (!roomsUsers[room] || !roomsUsers[room][socket.id])
                return;
            const user = roomsUsers[room][socket.id];
            socket.to(room).emit("receive-message", user, message);
        });
        socket.on("disconnect", () => {
            const rooms = Object.keys(roomsUsers);
            rooms.forEach((room) => {
                const user = roomsUsers[room][socket.id];
                if (!user)
                    return;
                delete roomsUsers[room][socket.id];
                socket.to(room).emit("user-disconnected", user);
                socket.to(room).emit("receive-members", roomsUsers[room]);
            });
        });
    });
    httpServer
        .once("error", (err) => {
        console.error(err);
        process.exit(1);
    })
        .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
