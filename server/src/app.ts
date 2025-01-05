import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import "dotenv/config";
import IUser from "./types/IUser";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.PORT || 3000;

const waitingUser: string[] = [];
const pairedUser: { [key: string]: string } = {};

io.on("connection", (socket) => {
  socket.on("find-pair", () => {
    if (waitingUser.includes(socket.id)) {
      return;
    } else if (pairedUser[socket.id]) {
      return;
    }

    if (waitingUser.length > 0) {
      let isPaired = false;

      for (let i = 0; i < waitingUser.length; i++) {
        const pairedSocketId = waitingUser.splice(i, 1)[0];

        pairedUser[socket.id] = pairedSocketId;
        pairedUser[pairedSocketId] = socket.id;
        io.to(socket.id).emit("pair-found");
        io.to(pairedSocketId).emit("pair-found");

        isPaired = true;
        break;
      }

      if (!isPaired) {
        waitingUser.push(socket.id);
      }
    } else {
      waitingUser.push(socket.id);
    }
  });

  socket.on("exchange-info", (info: IUser) => {
    const pairedSocketId = pairedUser[socket.id];

    if (pairedSocketId) {
      io.to(pairedSocketId).emit("receive-info", info);
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
    const waitingIndex = waitingUser.indexOf(socket.id);

    if (waitingIndex !== -1) {
      waitingUser.splice(waitingIndex, 1);
    }

    const pairedSocketId = pairedUser[socket.id];

    if (pairedSocketId) {
      io.to(pairedSocketId).emit("pair-disconnected");

      delete pairedUser[socket.id];
      delete pairedUser[pairedSocketId];
    }
  });
});

server.listen(PORT, () => {
  console.log(`Express is listening at http://localhost:${PORT}`);
});
