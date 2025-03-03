import { NextApiRequest, NextApiResponse } from 'next';
import { getSocketInstance } from '../../lib/socket';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Extract data from the request body
    const { teamId, stackName, roleArn, externalId, status, message } = req.body;

    // Build the update object
    const update = {
      teamId,
      stackName,
      roleArn,
      externalId,
      status: status || "CREATE_COMPLETE",
      message: message || "Deployment completed successfully",
      timestamp: new Date().toISOString(),
    };

    // Get the shared Socket.IO instance
    const io = getSocketInstance();

    // Emit the update via WebSocket
    io.emit('deploymentUpdate', update);
    console.log("Emitted deployment update via WebSocket:", update);

    // Respond to the client
    res.status(200).json({ success: true, update });
  } catch (error: any) {
    console.error("Error in notifyDeploymentComplete endpoint:", error);
    res.status(500).json({ error: error.message });
  }
}