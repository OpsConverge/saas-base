// lambda/notifydeployment/index.mjs
import https from 'https';
import { parse as urlParse } from 'url';

export async function handler(event, context) {
  console.log("Custom Resource Event:", JSON.stringify(event, null, 2));

  let responseStatus = "SUCCESS";
  let responseData = {};

  try {
    // Handle Delete events by signaling success immediately.
    if (event.RequestType === 'Delete') {
      return await sendResponse(event, context, "SUCCESS");
    }

    // Extract required properties from the event.
    const roleArn = event.ResourceProperties.RoleArn;             // e.g., !Ref RoleArn
    const externalId = event.ResourceProperties.ExternalID;       // e.g., !Ref ExternalID
    const teamId = event.ResourceProperties.TeamID;               // e.g., !Ref TeamID
    const stackName = event.ResourceProperties.StackName;         // e.g., !Ref AWS::StackName
    const frontendUrl = event.ResourceProperties.FrontendURL;     // e.g., !GetAtt FrontendBucket.WebsiteURL
    const backendApiEndpoint = event.ResourceProperties.BackendAPIEndpoint; // e.g., Backend API URL
    const databaseEndpoint = event.ResourceProperties.DatabaseEndpoint;     // e.g., Database Endpoint

    // Validate required properties.
    if (!roleArn || !externalId || !teamId || !stackName) {
      throw new Error("Missing required properties: RoleArn, ExternalID, TeamID, or StackName");
    }

    // Prepare the payload for the external system.
    const postData = JSON.stringify({
      roleArn,
      externalId,
      teamId,
      stackName,
      frontendUrl,
      backendApiEndpoint,
      databaseEndpoint,
    });

    // Call the notification endpoint to push a real-time update.
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

/**
 * Sends a POST request to the specified endpoint.
 * @param {string} endpoint - The URL of the endpoint.
 * @param {string} postData - The JSON payload to send.
 */
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

/**
 * Sends a response back to CloudFormation.
 * @param {object} event - The event object from CloudFormation.
 * @param {object} context - The Lambda execution context.
 * @param {string} responseStatus - The status ("SUCCESS" or "FAILED").
 * @param {object} responseData - Optional data to include in the response.
 */
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