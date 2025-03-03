// lib/socket.ts
import { Server as IOServer } from 'socket.io';

let ioInstance: any;

export const initializeSocket = (server: any) => {
  if (!ioInstance) {
    console.log("Initializing new Socket.IO server...");
    ioInstance = new IOServer(server, {
      path: '/api/socket',
      cors: {
        origin: '*', // Allow all origins (adjust for production)
        methods: ['GET', 'POST'],
      },
    });

    ioInstance.on('connection', (socket: any) => {
      console.log("Client connected:", socket.id);

      socket.on('disconnect', () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  return ioInstance;
};

export const getSocketInstance = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO server not initialized");
  }
  return ioInstance;
};