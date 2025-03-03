import { Server as IOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let ioInstance: IOServer | null = null;

/**
 * Initializes the Socket.IO server.
 * @param server - The HTTP server instance.
 * @returns The initialized Socket.IO server instance.
 */
export const initializeSocket = (server: HttpServer): IOServer => {
  if (!ioInstance) {
    console.log("Initializing new Socket.IO server...");

    // Create a new Socket.IO server instance
    ioInstance = new IOServer(server, {
      path: '/api/socket', // Custom path for WebSocket connections
      cors: {
        origin: '*', // Allow all origins (adjust for production)
        methods: ['GET', 'POST'],
      },
    });

    // Handle client connections
    ioInstance.on('connection', (socket: Socket) => {
      console.log("Client connected:", socket.id);

      // Handle client disconnections
      socket.on('disconnect', () => {
        console.log("Client disconnected:", socket.id);
      });

      // Handle custom events (if needed)
      socket.on('customEvent', (data: any) => {
        console.log("Received custom event:", data);
        // Emit a response or broadcast to other clients
        socket.emit('customEventResponse', { message: 'Event received' });
      });
    });

    // Handle connection errors
    ioInstance.on('connect_error', (error: Error) => {
      console.error("Socket.IO server error:", error);
    });
  }

  return ioInstance;
};

/**
 * Retrieves the initialized Socket.IO server instance.
 * @throws Error if the server is not initialized.
 * @returns The Socket.IO server instance.
 */
export const getSocketInstance = (): IOServer => {
  if (!ioInstance) {
    throw new Error("Socket.IO server not initialized");
  }
  return ioInstance;
};