import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SERVER_URL, {
  autoConnect: false,
});

const roomSocket = io(import.meta.env.VITE_SERVER_URL + "/room", {
  autoConnect: false,
});

export { socket, roomSocket };
