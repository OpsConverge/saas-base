import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const CloudConnect = () => {
  const [deploymentStatus, setDeploymentStatus] = useState<string>('Pending');
  const [deploymentMessage, setDeploymentMessage] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<'aws' | 'azure' | 'gcp' | null>(null);
  const [teamId, setTeamId] = useState<string>(''); // Team ID from session
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize Socket.IO connection for deployment updates.
  useEffect(() => {
    const socket = io('http://localhost:4002', {
      transports: ['websocket'], // Force WebSocket transport
    });

    // Listen for deployment updates from the backend.
    socket.on('deploymentUpdate', (update) => {
      console.log('Received deployment update:', update);
      setDeploymentStatus(update.status);
      setDeploymentMessage(update.message);

      if (update.status === 'CREATE_COMPLETE') {
        toast.success('Deployment completed successfully!');
      } else if (update.status === 'FAILED') {
        toast.error(`Deployment failed: ${update.message}`);
      }
    });

    // Handle connection errors.
    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      toast.error('Failed to connect to the deployment server.');
    });

    // Clean up the socket connection on unmount.
    return () => {
      socket.disconnect();
    };
  }, []);

  // Retrieve the session and extract the team ID.
  useEffect(() => {
    async function fetchSession() {
      const session = await getSession();
      console.log('Session:', session);

      // Assuming your session contains the team ID in session.user.teamId.
      if (session?.user?.teamId) {
        setTeamId(session.user.teamId);
      } else {
        console.error('Team ID not found in session.');
      }
    }

    fetchSession();
  }, []);

  // Handle AWS-specific flow using the teamId from the session.
  const handleAwsConnection = async () => {
    if (!teamId) {
      toast.error('Team ID not found in your session.');
      return;
    }

    setLoading(true);
    setDeploymentStatus('Pending'); // Reset status to "Pending" when starting a new deployment.

    try {
      // Generate a random external ID.
      const externalId = Math.random().toString(36).substring(2, 10);
      const region = 'us-east-2';
      const stackName = `MyStack-${Date.now()}`;
      const rawTemplateUrl = `https://opsconverge01.s3.${region}.amazonaws.com/Basic.yaml`;
      const encodedTemplateUrl = encodeURIComponent(rawTemplateUrl);

      // Build the CloudFormation Quick Create URL, including the team ID.
      const quickCreateUrl = `https://console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/quickcreate?templateUrl=${encodedTemplateUrl}&stackName=${stackName}&param_ExternalID=${externalId}&param_TeamID=${teamId}&capabilities=CAPABILITY_IAM`;
      console.log('Quick Create URL:', quickCreateUrl);

      // Open the URL in a new tab, which triggers CloudFormation.
      window.open(quickCreateUrl, '_blank');

      toast.success('Opened AWS CloudFormation console in a new tab!');
    } catch (error) {
      console.error('Error during AWS connection:', error);
      toast.error('An error occurred while processing your request.');
      setDeploymentStatus('FAILED');
      setDeploymentMessage('An error occurred while connecting to AWS.');
    } finally {
      setLoading(false);
    }
  };

  // Determine button label based on loading state and deployment status.
  const buttonLabel = loading
    ? 'Connecting...'
    : deploymentStatus === 'CREATE_COMPLETE'
    ? 'Deployment Complete'
    : 'Connect to AWS';

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Connect to Cloud</h2>

      {/* Cloud Provider Selection */}
      <div className="mb-6">
        <p className="mb-2">Select a cloud provider to connect:</p>
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedProvider('aws')}
            className={`px-4 py-2 rounded ${
              selectedProvider === 'aws'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            AWS
          </button>
          <button
            onClick={() => setSelectedProvider('azure')}
            className={`px-4 py-2 rounded ${
              selectedProvider === 'azure'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Azure
          </button>
          <button
            onClick={() => setSelectedProvider('gcp')}
            className={`px-4 py-2 rounded ${
              selectedProvider === 'gcp'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            GCP
          </button>
        </div>
      </div>

      {/* AWS-Specific Flow */}
      {selectedProvider === 'aws' && (
        <div className="border p-4 rounded">
          <h3 className="text-lg font-medium mb-2">Connect to AWS</h3>
          <p className="mb-2">
            {teamId
              ? `Your Team ID: ${teamId}`
              : 'Team ID is not available. Please log in or contact support.'}
          </p>
          <div className="mb-4">
            <p className="font-medium">Deployment Status:</p>
            <p>{deploymentStatus}</p>
            {deploymentMessage && (
              <p className="text-sm text-gray-600">{deploymentMessage}</p>
            )}
          </div>
          <button
            onClick={handleAwsConnection}
            disabled={loading || !teamId || deploymentStatus === 'CREATE_COMPLETE'}
            className={`px-4 py-2 rounded flex items-center justify-center ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connecting...
              </>
            ) : (
              buttonLabel
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CloudConnect;