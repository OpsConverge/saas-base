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
      return res.status(400).json({ error: 'Missing teamId, roleArn, or externalId' });
    }

    // Log the incoming data for debugging
    console.log(`Storing cross-account role info for teamId: ${teamId}`);

    // Update the team record in the database
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        roleArn,
        externalId,
        teamId: teamId, // Explicitly store the teamId (optional, if needed)
      },
    });

    return res.status(200).json({ success: true, data: updatedTeam });
  } catch (error) {
    console.error('Error storing cross-account role info:', error);

    // Handle specific Prisma errors (e.g., team not found)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Team not found' });
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
}