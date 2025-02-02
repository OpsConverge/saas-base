import { getSession } from 'next-auth/react';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await fetch('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }

    const repos = await response.json();
    res.status(200).json(repos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
}