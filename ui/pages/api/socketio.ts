// pages/api/socketio.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing so Socket.IO can work correctly.
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!res.socket.server.io) {
    console.log('Initializing new Socket.IO server...');
    const io = new IOServer(res.socket.server);
    // Optional: add namespaces or event listeners.
    io.on('connection', (socket) => {
      console.log('Client connected: ', socket.id);
      socket.on('disconnect', () => {
        console.log('Client disconnected: ', socket.id);
      });
    });
    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;
