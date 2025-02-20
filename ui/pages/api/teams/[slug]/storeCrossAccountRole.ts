// pages/api/teams/storeCrossAccountRole.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function storeCrossAccountRole(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { teamId, roleArn, externalId } = req.body;
    
    // Validate input
    if (!teamId || !roleArn || !externalId) {
      return res
        .status(400)
        .json({ error: 'Missing teamId, roleArn, or externalId' });
    }

    // Update the team record in the database
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        roleArn,
        externalId,
      },
    });

    return res.status(200).json({ success: true, data: updatedTeam });
  } catch (error) {
    console.error('Error storing cross-account role info:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
