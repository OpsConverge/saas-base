// pages/api/teams/storeCrossAccountRoleCallback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { teamId, roleArn, externalId } = req.body;
    if (!teamId || !roleArn || !externalId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        roleArn,
        externalId,
      },
    });

    console.log("Updated team:", updatedTeam);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error updating team role info:", error);
    res.status(500).json({ error: error.message });
  }
}
