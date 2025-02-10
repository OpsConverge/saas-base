import { STS } from 'aws-sdk';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { awsAccountId } = req.body;

  const sts = new STS({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const params = {
    RoleArn: `arn:aws:iam::${process.env.YOUR_AWS_ACCOUNT_ID}:role/DevOpsPlatformDeploymentRole`,
    RoleSessionName: 'DevOpsPlatformSession',
    ExternalId: process.env.EXTERNAL_ID,
  };

  try {
    const data = await sts.assumeRole(params).promise();
    res.status(200).json(data.Credentials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assume role' });
  }
}