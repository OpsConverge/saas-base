// File: pages/api/auth/aws/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { STSClient, AssumeRoleWithWebIdentityCommand } from '@aws-sdk/client-sts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state } = req.query;
  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  let parsedState;
  try {
    parsedState = JSON.parse(state as string);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid state parameter' });
  }

  // Exchange authorization code for tokens from Cognito
  const tokenUrl = `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/token`;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/aws/callback`;
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code as string);
  params.append('redirect_uri', redirectUri);
  params.append('client_id', process.env.NEXT_PUBLIC_AWS_CLIENT_ID as string);
  // Optionally append client_secret if required.

  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    return res.status(500).json({ error: `Token exchange failed: ${errText}` });
  }

  const tokenData = await tokenResponse.json();
  // Use the id_token (or access_token, based on your configuration)
  const webIdentityToken = tokenData.id_token;

  // Use AWS STS to assume a role with web identity
  const stsClient = new STSClient({ region: process.env.AWS_REGION });
  const command = new AssumeRoleWithWebIdentityCommand({
    RoleArn: process.env.AWS_ROLE_ARN as string,
    RoleSessionName: 'deploySession',
    WebIdentityToken: webIdentityToken,
    DurationSeconds: 3600,
  });

  let stsResponse;
  try {
    stsResponse = await stsClient.send(command);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'STS assume role failed' });
  }

  const credentials = stsResponse.Credentials;
  if (!credentials) {
    return res.status(500).json({ error: 'Failed to obtain temporary credentials' });
  }

  // Now trigger the deployment API route by dispatching the GitHub Action workflow.
  const triggerResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/trigger-deployment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template: parsedState.template,
      teamId: parsedState.teamId,
      provider: parsedState.provider,
      temporaryCredentials: credentials,
    }),
  });

  if (!triggerResponse.ok) {
    const errText = await triggerResponse.text();
    return res.status(500).json({ error: errText });
  }

  // Redirect the user back to the infrastructure page, with an authenticated flag.
  res.redirect(`/teams/${parsedState.teamId}/infrastructure?authenticated=true`);
}
