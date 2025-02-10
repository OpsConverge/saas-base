import { STS, IAM, CloudFormation } from 'aws-sdk';

export const updateTrustPolicy = async (awsAccountId: string) => {
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

  await iam.updateAssumeRolePolicy(params).promise();
};

export const assumeRole = async () => {
  const sts = new STS({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const params = {
    RoleArn: `arn:aws:iam::${process.env.YOUR_AWS_ACCOUNT_ID}:role/DevOpsPlatformDeploymentRole`,
    RoleSessionName: 'DevOpsPlatformSession',
    ExternalId: process.env.EXTERNAL_ID,
  };

  const data = await sts.assumeRole(params).promise();
  return data.Credentials;
};

export const deployTemplate = async (credentials: any, templateUrl: string) => {
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

  const data = await cloudformation.createStack(params).promise();
  return data.StackId;
};