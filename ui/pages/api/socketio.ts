// pages/api/socketio.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeSocket } from '../../lib/socket';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const socket = res.socket as any;

  if (!socket || !socket.server) {
    res.status(500).end("Socket not found");
    return;
  }

  // Initialize the Socket.IO server using the centralized function
  initializeSocket(socket.server);

  res.end();
};

export default SocketHandler;