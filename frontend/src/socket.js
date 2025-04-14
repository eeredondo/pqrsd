// socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  transports: ["websocket"],
  autoConnect: false, // ← Muy importante
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export default socket;
