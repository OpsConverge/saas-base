import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';

// Define the type for the `team` prop
interface Team {
  id: string;
  name: string;
}

interface DeployInfraFlowProps {
  team: Team; // Add the `team` prop to the component's props
}

const DeployInfraFlow: React.FC<DeployInfraFlowProps> = ({ team }) => {
  const [deploymentStatus, setDeploymentStatus] = useState<string>('Pending');
  const [deploymentMessage, setDeploymentMessage] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<'aws' | 'azure' | 'gcp' | null>(null);
  const [teamRole, setTeamRole] = useState<{ roleArn: string; externalId: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize Socket.IO connection for deployment updates.
  useEffect(() => {
    const socket = io('http://localhost:4002', {
      path: '/api/socket',
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('deploymentUpdate', (update) => {
      console.log('Received deployment update:', update);
      setDeploymentStatus(update.status);
      setDeploymentMessage(update.message);

      if (update.status === 'CREATE_COMPLETE' || update.status === 'FAILED') {
        setLoading(false);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      toast.error('Failed to connect to the deployment server.');
      setLoading(false);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      toast.error('Lost connection to the deployment server.');
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch TeamRole using the teamId.
  useEffect(() => {
    const fetchTeamRole = async () => {
      try {
        if (!team.id) return;

        const response = await axios.get(`/api/getTeamRole?teamId=${team.id}`);
        setTeamRole(response.data);
        console.log('Fetched TeamRole:', response.data);
      } catch (error) {
        console.error('Error fetching TeamRole:', error);
        toast.error('Failed to fetch team role information.');
      }
    };

    fetchTeamRole();
  }, [team.id]);

  // Handle AWS-specific flow for deploying infrastructure.
  const handleDeploy = async () => {
    if (!team.id || !teamRole) {
      toast.error('Team ID or role information is missing.');
      return;
    }

    setLoading(true);

    try {
      const region = 'us-east-2';
      const stackName = `MyStack-${Date.now()}`;
      const rawTemplateUrl = `https://opsconverge01.s3.${region}.amazonaws.com/Basic2.yaml`;
      const encodedTemplateUrl = encodeURIComponent(rawTemplateUrl);

      const quickCreateUrl = `https://console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/quickcreate?templateUrl=${encodedTemplateUrl}&stackName=${stackName}&param_RoleArn=${encodeURIComponent(teamRole.roleArn)}&param_ExternalID=${teamRole.externalId}&capabilities=CAPABILITY_IAM`;

      console.log("Quick Create URL:", quickCreateUrl);

      window.open(quickCreateUrl, '_blank');

      toast.success('Opened AWS CloudFormation console in a new tab!');
    } catch (error) {
      console.error('Error during deployment:', error);
      toast.error('An error occurred while processing your request.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Deploy Infrastructure</h2>

      {/* Cloud Provider Selection */}
      <div className="mb-6">
        <p className="mb-2">Select a cloud provider to deploy:</p>
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
          <h3 className="text-lg font-medium mb-2">Deploy to AWS</h3>
          <p className="mb-2">
            {team.id
              ? `Your Team ID: ${team.id}`
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
            onClick={handleDeploy}
            disabled={loading || !team.id || !teamRole}
            className={`px-4 py-2 rounded flex items-center justify-center ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                {/* Spinner Icon */}
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
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
                Deploying...
              </>
            ) : (
              'Deploy to AWS'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default DeployInfraFlow;