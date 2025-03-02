import { Server as IOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (res.socket && !(res.socket as any).server.io) {
    const io = new IOServer((res.socket as any).server);
    (res.socket as any).server.io = io;

    io.on('connection', (socket) => {
      console.log('New client connected');
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  res.end();
}
