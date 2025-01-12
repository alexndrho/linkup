import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import "dotenv/config";
import IUser from "./types/IUser";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
});
const PORT = process.env.PORT || 3000;

const roomNamespace = io.of("/room");
const waitingUserChat: string[] = [];
const waitingUserVideoChat: string[] = [];
const pairedUser: { [key: string]: string } = {};

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  }),
);

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

  socket.on("exchange-info", (info: IUser) => {
    const pairedSocketId = pairedUser[socket.id];

    if (pairedSocketId) {
      io.to(pairedSocketId).emit("receive-info", info);
    }
  });

  socket.on("send-peer-id", (peerId: string) => {
    const pairedSocketId = pairedUser[socket.id];

    if (pairedSocketId) {
      io.to(pairedSocketId).emit("receive-peer-id", peerId);
    }
  });

  socket.on(
    "send-message",
    (message: { sender: "me" | "stranger"; content: string }) => {
      const pairedSocketId = pairedUser[socket.id];

      if (pairedSocketId) {
        io.to(pairedSocketId).emit("receive-message", message);
      }
    },
  );

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
const roomsUsers: {
  [key: string]: {
    [key: string]: IUser;
  };
} = {};

roomNamespace.on("connection", (socket) => {
  socket.on("join-room", (room: string, user: IUser, cb?: () => void) => {
    socket.join(room);

    if (!roomsUsers[room]) {
      roomsUsers[room] = {};
    }

    roomsUsers[room][socket.id] = user;

    socket.to(room).emit("user-connected", user);

    socket.nsp.to(room).emit("receive-members", roomsUsers[room]);

    if (cb) cb();
  });

  socket.on("send-message", (room: string, message) => {
    if (!roomsUsers[room] || !roomsUsers[room][socket.id]) return;

    const user = roomsUsers[room][socket.id];
    socket.to(room).emit("receive-message", user, message);
  });
  socket.on("disconnect", () => {
    const rooms = Object.keys(roomsUsers);

    rooms.forEach((room) => {
      const user = roomsUsers[room][socket.id];

      if (!user) return;

      delete roomsUsers[room][socket.id];

      socket.to(room).emit("user-disconnected", user);
      socket.to(room).emit("receive-members", roomsUsers[room]);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Express is listening at http://localhost:${PORT}`);
});
