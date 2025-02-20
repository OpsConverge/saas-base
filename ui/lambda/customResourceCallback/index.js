// lambda/customResourceCallback/index.js

const https = require('https');
const url = require('url');

exports.handler = async (event, context) => {
  console.log("Custom Resource Event:", JSON.stringify(event, null, 2));

  try {
    // For Delete events, simply signal success.
    if (event.RequestType === 'Delete') {
      await sendResponse(event, context, "SUCCESS");
      return;
    }

    // Extract required properties from the event.
    // The CloudFormation template passes these properties.
    const OpsConvergeID = event.ResourceProperties.OpsConvergeID; // Provided in template.
    const stackName = event.ResourceProperties.StackName; // Passed using !Ref AWS::StackName
    // In some designs, you might retrieve the role ARN from a GetAtt, here we assume it is passed as an override.
    const roleArn = event.ResourceProperties.RoleArnOverride;
    const externalId = event.ResourceProperties.ExternalIDOverride;

    if (!OpsConvergeID || !stackName || !roleArn || !externalId) {
      throw new Error("Missing required properties: OpsConvergeID, StackName, RoleArnOverride, or ExternalIDOverride");
    }

    // Prepare the payload to send to your DevOps portal.
    const postData = JSON.stringify({
      OpsConvergeID,
      stackName,
      roleArn,
      externalId,
    });

    // Configure your portal's API endpoint.
    // Replace with your actual portal domain and API path.
    const endpoint = "https://OpsConverge.com/api/teams/storeCrossAccountRoleCallback";
    const parsedUrl = url.parse(endpoint);
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

    await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          console.log("Response from portal:", data);
          resolve();
        });
      });
      req.on('error', (e) => {
        console.error("Error sending data to portal:", e);
        reject(e);
      });
      req.write(postData);
      req.end();
    });

    // Signal success back to CloudFormation.
    await sendResponse(event, context, "SUCCESS");
  } catch (err) {
    console.error("Error in custom resource handler:", err);
    await sendResponse(event, context, "FAILED", { Error: err.message });
  }
};

// Helper function to send response back to CloudFormation.
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

    const parsedUrl = url.parse(event.ResponseURL);
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
