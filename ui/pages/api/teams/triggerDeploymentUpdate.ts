// pages/api/teams/[slug]/triggerDeploymentUpdate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';

const cfn = new AWS.CloudFormation({ region: 'us-east-1' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In a real scenario, you would have stored the stack name when initiating deployment.
    const { stackName } = req.query;
    if (!stackName || typeof stackName !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid stackName' });
    }

    // Retrieve stack details from CloudFormation.
    const describeResp = await cfn.describeStacks({ StackName: stackName }).promise();
    const stack = describeResp.Stacks?.[0];
    if (!stack) {
      return res.status(404).json({ error: 'Stack not found' });
    }

    // Build an update object.
    const update = {
      status: stack.StackStatus,
      message: stack.StackStatusReason || 'Deployment update retrieved successfully.',
      timestamp: new Date().toISOString(),
      outputs: stack.Outputs || [],
      stackName,
    };

    // Check if res.socket exists and has the Socket.IO instance.
    if (res.socket && (res.socket as any).server && (res.socket as any).server.io) {
      ((res.socket as any).server.io).emit('deploymentUpdate', update);
      console.log("Emitted deployment update:", update);
    } else {
      console.error("Socket.IO server not initialized or res.socket is null.");
    }

    return res.status(200).json({ success: true, update });
  } catch (error: any) {
    console.error("Error retrieving deployment update:", error);
    return res.status(500).json({ error: error.message });
  }
}
