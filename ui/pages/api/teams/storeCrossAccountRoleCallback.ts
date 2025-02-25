// pages/api/teams/storeTeamAWSRoleCallback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { teamId, roleArn, externalId } = req.body;
    if (!teamId || !roleArn || !externalId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updatedTeamRole = await prisma.teamRole.upsert({
      where: { teamId },
      update: { roleArn, externalId },
      create: { teamId, roleArn, externalId },
    });

    console.log("Updated TeamRole:", updatedTeamRole);
    res.status(200).json({ success: true, teamRole: updatedTeamRole });
  } catch (error: any) {
    console.error("Error updating team role info:", error);
    res.status(500).json({ error: error.message });
  }
}
