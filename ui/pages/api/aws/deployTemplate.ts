import { CloudFormation } from 'aws-sdk';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { credentials, templateUrl } = req.body;

  const cloudformation = new CloudFormation({
    accessKeyId: credentials.AccessKeyId,
    secretAccessKey: credentials.SecretAccessKey,
    sessionToken: credentials.SessionToken,
  });

  const params = {
    StackName: 'MyStack',
    TemplateURL: templateUrl,
    Capabilities: ['CAPABILITY_IAM'],
  };

  try {
    const data = await cloudformation.createStack(params).promise();
    res.status(200).json({ stackId: data.StackId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deploy template' });
  }
}