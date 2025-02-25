// lambda/customResourceCallback/index.mjs
import https from 'https';
import { parse as urlParse } from 'url';

export async function handler(event, context) {
  console.log("Custom Resource Event:", JSON.stringify(event, null, 2));

  let responseStatus = "SUCCESS";
  let responseData = {};

  try {
    if (event.RequestType === 'Delete') {
      // For Delete events, simply signal success.
      return await sendResponse(event, context, "SUCCESS");
    }

    // Extract required properties.
    const OpsConvergeID = event.ResourceProperties.OpsConvergeID;         // Provided in template.
    const stackName = event.ResourceProperties.StackName;                 // !Ref AWS::StackName
    const roleArn = event.ResourceProperties.RoleArnOverride;             // e.g. !GetAtt OpsConvergeRole.Arn
    const externalId = event.ResourceProperties.ExternalIDOverride;       // e.g. from parameter OpsConvergeID
    const teamId = event.ResourceProperties.TeamID;                       // New property: Team ID

    if (!OpsConvergeID || !stackName || !roleArn || !teamId) {
      throw new Error("Missing required properties: OpsConvergeID, StackName, RoleArnOverride, or TeamID");
    }

    // Prepare the payload.
    const postData = JSON.stringify({
      OpsConvergeID,
      stackName,
      roleArn,
      externalId,
      teamId, // Include the teamId in the payload
    });

    // 1. Call the storage endpoint to update your database.
    const storeEndpoint = "https://OpsConverge.com/api/teams/storeCrossAccountRoleCallback";
    await postToEndpoint(storeEndpoint, postData);

    // 2. Call the notification endpoint to push a real-time update.
    const notificationEndpoint = "https://OpsConverge.com/api/notifyDeploymentComplete";
    await postToEndpoint(notificationEndpoint, postData);

  } catch (err) {
    console.error("Error in custom resource handler:", err);
    responseStatus = "FAILED";
    responseData = { Error: err.message };
  } finally {
    try {
      await sendResponse(event, context, responseStatus, responseData);
      console.log("Response sent to CloudFormation");
    } catch (sendErr) {
      console.error("Error sending response to CloudFormation:", sendErr);
    }
  }
}

function postToEndpoint(endpoint, postData) {
  return new Promise((resolve, reject) => {
    const parsedUrl = urlParse(endpoint);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Response from ${endpoint}:`, data);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`Error sending data to ${endpoint}:`, e);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

function sendResponse(event, context, responseStatus, responseData = {}) {
  return new Promise((resolve, reject) => {
    const responseBody = JSON.stringify({
      Status: responseStatus,
      Reason: "See CloudWatch log: " + context.logStreamName,
      PhysicalResourceId: event.PhysicalResourceId || context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      Data: responseData,
    });
    console.log("Response body:", responseBody);

    const parsedUrl = urlParse(event.ResponseURL);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: 'PUT',
      headers: {
        'content-type': '',
        'content-length': Buffer.byteLength(responseBody),
      },
    };

    const req = https.request(options, (res) => {
      console.log("Status code from CloudFormation response:", res.statusCode);
      resolve();
    });

    req.on('error', (error) => {
      console.error("sendResponse error:", error);
      reject(error);
    });

    req.write(responseBody);
    req.end();
  });
}

export default handler;