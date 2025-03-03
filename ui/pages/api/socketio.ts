import { NextApiRequest, NextApiResponse } from 'next';
import { initializeSocket } from '../../lib/socket';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for WebSocket connections
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const socket = req.socket as any;

  if (!socket || !socket.server) {
    res.status(500).end("Socket not found");
    return;
  }

  // Initialize the Socket.IO server
  initializeSocket(socket.server);

  res.end();
};

export default SocketHandler;