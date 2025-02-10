import { IAM } from 'aws-sdk';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { awsAccountId } = req.body;

  const iam = new IAM({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const trustPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: {
          AWS: `arn:aws:iam::${awsAccountId}:root`,
        },
        Action: 'sts:AssumeRole',
        Condition: {
          StringEquals: {
            'sts:ExternalId': process.env.EXTERNAL_ID,
          },
        },
      },
    ],
  };

  const params = {
    RoleName: 'DevOpsPlatformDeploymentRole',
    PolicyDocument: JSON.stringify(trustPolicy),
  };

  try {
    await iam.updateAssumeRolePolicy(params).promise();
    res.status(200).json({ message: 'Trust policy updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update trust policy' });
  }
}