// pages/api/teams/triggerDeploymentUpdate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';

// Configure CloudFormation client; adjust the region as needed.
const cfn = new AWS.CloudFormation({ region: 'us-east-2' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In a real scenario, you would receive the stack name (and possibly team info)
    // from your deployment logic (e.g., stored in your DB when initiating deployment).
    const { stackName } = req.query;
    if (!stackName || typeof stackName !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid stackName' });
    }

    // Retrieve the stack details from CloudFormation.
    const describeResp = await cfn.describeStacks({ StackName: stackName }).promise();
    const stack = describeResp.Stacks && describeResp.Stacks[0];
    if (!stack) {
      return res.status(404).json({ error: 'Stack not found' });
    }

    // Build an update object using actual deployment details.
    const update = {
      status: stack.StackStatus, // e.g., "CREATE_COMPLETE", "CREATE_IN_PROGRESS", etc.
      message: stack.StackStatusReason || "Deployment update retrieved successfully.",
      timestamp: new Date().toISOString(),
      outputs: stack.Outputs || [],
    };

    // If you are using WebSockets (e.g. Socket.IO) to push updates:
    if (res.socket.server.io) {
      res.socket.server.io.emit('deploymentUpdate', update);
      console.log("Emitted deployment update:", update);
    } else {
      console.log("Socket.IO server not initialized.");
    }

    // Return the update in the API response.
    return res.status(200).json({ success: true, update });
  } catch (error: any) {
    console.error("Error retrieving deployment update:", error);
    return res.status(500).json({ error: error.message });
  }
}
