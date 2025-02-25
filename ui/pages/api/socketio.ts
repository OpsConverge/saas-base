// pages/api/socketio.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  // Ensure res.socket exists.
  if (!res.socket) {
    res.status(500).end("Socket not found");
    return;
  }

  // Cast res.socket to any so that we can access custom properties.
  const socket: any = res.socket;

  // Check if the Socket.IO server is already initialized on the underlying HTTP server.
  if (!socket.server || !socket.server.io) {
    console.log("Initializing new Socket.IO server...");
    // Attach Socket.IO to the HTTP server.
    const io = new IOServer(socket.server);
    io.on('connection', (socket: any) => {
      console.log("Client connected:", socket.id);
      socket.on('disconnect', () => {
        console.log("Client disconnected:", socket.id);
      });
    });
    // Save the io instance on the server so that subsequent requests reuse it.
    socket.server.io = io;
  }
  
  res.end();
};

export default SocketHandler;
