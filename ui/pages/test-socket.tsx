// pages/test-socket.tsx
import { useEffect } from 'react';
import io from 'socket.io-client';

const TestSocket = () => {
  useEffect(() => {
    const socket = io('http://localhost:4002/api/socket');

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>Testing WebSocket connection...</div>;
};

export default TestSocket;