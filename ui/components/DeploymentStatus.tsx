// components/DeploymentStatus.tsx
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

let socket: SocketIOClient.Socket;

const DeploymentStatus: React.FC = () => {
  const [status, setStatus] = useState<string>('Pending');
  const [message, setMessage] = useState<string>('Waiting for deployment update...');

  useEffect(() => {
    // Connect to the Socket.IO server. (Assumes your server is set up to serve Socket.IO.)
    socket = io(); // You can also specify a URL if needed.
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket server with ID:', socket.id);
    });

    socket.on('deploymentUpdate', (data: any) => {
      console.log('Received deployment update:', data);
      setStatus(data.status);
      setMessage(data.message);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server.');
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h3>Deployment Status</h3>
      <p>Status: {status}</p>
      <p>Message: {message}</p>
    </div>
  );
};

export default DeploymentStatus;
