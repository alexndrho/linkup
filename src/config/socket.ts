import { io } from "socket.io-client";

const socket = io({
  autoConnect: false,
});

const roomSocket = io("/room", {
  autoConnect: false,
});

export { socket, roomSocket };
