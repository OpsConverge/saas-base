// pages/api/getTeamRole.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure only GET requests are allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract teamId from query parameters
  const { teamId } = req.query;

  // Validate teamId
  if (!teamId) {
    return res.status(400).json({ error: 'Missing teamId parameter' });
  }

  try {
    // Fetch the TeamRole record from the database
    const teamRole = await prisma.teamRole.findFirst({
      where: { teamId: teamId as string },
    });

    // Check if a matching record was found
    if (!teamRole) {
      return res.status(404).json({ error: 'TeamRole not found' });
    }

    // Return the TeamRole record as JSON
    return res.status(200).json(teamRole);
  } catch (error: any) {
    console.error('Error fetching TeamRole:', error);
    return res.status(500).json({ error: error.message });
  }
}