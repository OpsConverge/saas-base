import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const CloudConnect = () => {
  const [deploymentStatus, setDeploymentStatus] = useState<string>('Pending');
  const [deploymentMessage, setDeploymentMessage] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<'aws' | 'azure' | 'gcp' | null>(null);
  const [tenantId, setTenantId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize Socket.IO connection
  useEffect(() => {
<<<<<<< working
    const socket = io(); // Connect to the Socket.IO server
=======
    const socket = io('https://opsconverge.com', {
      path: '/api/socket',
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });
>>>>>>> local

    // Listen for deployment updates
    socket.on('deploymentUpdate', (update) => {
      console.log('Received deployment update:', update);
      setDeploymentStatus(update.status);
      setDeploymentMessage(update.message);

      // Show a notification
      if (update.status === 'CREATE_COMPLETE') {
        toast.success('Deployment completed successfully!');
      } else if (update.status === 'FAILED') {
        toast.error(`Deployment failed: ${update.message}`);
      }
    });

    return () => {
      socket.disconnect(); // Clean up the connection on unmount
    };
  }, []);

  // Handle AWS-specific flow
  const handleAwsConnection = async () => {
    if (!tenantId) {
      toast.error('Please provide your Tenant ID.');
      return;
    }

    setLoading(true);

    try {
      // Simulate triggering the CloudFormation stack creation
      const externalId = Math.random().toString(36).substring(2, 10);
      const region = 'us-east-2';
      const stackName = `MyStack-${Date.now()}`;
      const rawTemplateUrl = `https://opsconverge01.s3.${region}.amazonaws.com/Basic.yaml`;
      const encodedTemplateUrl = encodeURIComponent(rawTemplateUrl);

      const quickCreateUrl = `https://console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/quickcreate?templateUrl=${encodedTemplateUrl}&stackName=${stackName}&param_TenantID=${tenantId}&param_ExternalID=${externalId}&capabilities=CAPABILITY_IAM`;

      window.open(quickCreateUrl, '_blank');

      toast.success('Opened AWS CloudFormation console in a new tab!');
    } catch (error) {
      console.error('Error during AWS connection:', error);
      toast.error('An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="mb-2">Please provide the following details to proceed:</p>

          {/* Tenant ID Input */}
          <div className="mb-4">
            <label htmlFor="tenant-id" className="block text-sm font-medium text-gray-700">
              Tenant ID
            </label>
            <input
              id="tenant-id"
              type="text"
              placeholder="Enter your Tenant ID"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Deployment Status */}
          <div className="mb-4">
            <p className="font-medium">Deployment Status:</p>
            <p>{deploymentStatus}</p>
            {deploymentMessage && <p className="text-sm text-gray-600">{deploymentMessage}</p>}
          </div>

          {/* Connect Button */}
          <button
            onClick={handleAwsConnection}
            disabled={loading || !tenantId}
            className={`px-4 py-2 rounded ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Connecting...' : 'Connect to AWS'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CloudConnect;
