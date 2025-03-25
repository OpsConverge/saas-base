import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Extract update details from the request body
    const { teamId, stackName, roleArn, externalId, status, message } = req.body;

    // Validate required fields
    if (!teamId || !stackName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build an update object
    const update = {
      teamId,
      stackName,
      roleArn,
      externalId,
      status: status || "CREATE_COMPLETE",
      message: message || "Deployment completed successfully",
      timestamp: new Date().toISOString(),
    };

    // Emit WebSocket update if available
    if (res.socket && (res.socket as any).server.io) {
      const io = (res.socket as any).server.io;
      io.emit(`team:${teamId}:deploymentUpdate`, update);
      console.log("Emitted deployment update via WebSocket:", update);
    } else {
      console.warn("Socket.IO server not initialized");
    }

    // Return a successful response
    res.status(200).json({ success: true, update });
  } catch (error: any) {
    console.error("Error in notifyDeploymentComplete endpoint:", error);
    res.status(500).json({ error: error.message });
  }
} 