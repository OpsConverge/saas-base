// pages/api/notifyDeploymentComplete.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Extract update details from the request body.
    // In a real scenario, the Lambda function will supply these details.
    const { teamId, stackName, roleArn, externalId, status, message } = req.body;

    // Build an update object.
    // You can include additional properties as needed.
    const update = {
      teamId,
      stackName,
      roleArn,
      externalId,
      status: status || "CREATE_COMPLETE", // default status if not provided
      message: message || "Deployment completed successfully",
      timestamp: new Date().toISOString(),
    };

    // Check if Socket.IO is initialized on the response socket.
    if (res.socket && (res.socket as any).server.io) {
      const io = (res.socket as any).server.io;
      io.emit('deploymentUpdate', update);
      console.log("Emitted deployment update via WebSocket:", update);
    } else {
      console.error("Socket.IO server not initialized");
    }

    // Return a successful JSON response.
    res.status(200).json({ success: true, update });
  } catch (error: any) {
    console.error("Error in notifyDeploymentComplete endpoint:", error);
    res.status(500).json({ error: error.message });
  }
}
