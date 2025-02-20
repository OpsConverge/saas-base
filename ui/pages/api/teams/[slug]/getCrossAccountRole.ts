// pages/api/teams/getCrossAccountRole.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId } = req.query;
  if (!teamId || typeof teamId !== 'string') {
    return res.status(400).json({ error: 'Missing teamId parameter' });
  }
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { roleArn: true, externalId: true },
    });
    if (!team || !team.roleArn || !team.externalId) {
      return res.status(404).json({ error: 'Role info not found' });
    }
    res.status(200).json(team);
  } catch (error: any) {
    console.error("Error retrieving team role info:", error);
    res.status(500).json({ error: error.message });
  }
}
