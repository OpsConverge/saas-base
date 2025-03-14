// File: components/team/DeployInfraFlow.tsx

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import DeploymentStatus from '../DeploymentStatus';

interface DeployInfraFlowProps {
  team: {
    id: string;
    name: string;
  };
}

const DeployInfraFlow: React.FC<DeployInfraFlowProps> = ({ team }) => {
<<<<<<< working
  // Steps: 1=Intro, 2=Select Provider, 3=Select Template, 4=AWS Account ID, 5=Done
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [awsAccountId, setAwsAccountId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Example provider/template options
  const cloudProviderOptions = [
    { id: 'aws', name: 'AWS' },
    { id: 'azure', name: 'Azure' },
    { id: 'gcp', name: 'GCP' },
  ];

  const templateOptions = [
    { id: 'template-1', name: 'Basic Deployment' },
    { id: 'template-2', name: 'Blue/Green Deployment' },
    { id: 'template-3', name: 'Canary Deployment' },
  ];

  // Handle "Next" button
  const handleNext = () => {
    // Validate required fields at each step
    if (currentStep === 2 && !selectedProvider) {
      toast.error('Please select a cloud provider.');
      return;
    }
    if (currentStep === 3 && !selectedTemplate) {
      toast.error('Please select a deployment template.');
      return;
    }
    if (currentStep === 4 && !awsAccountId) {
      toast.error('Please provide your AWS account ID (optional for demo, but required for your real flow).');
      // If truly optional, remove this check.
=======
  const [deploymentStatus, setDeploymentStatus] = useState<string>('Pending');
  const [deploymentMessage, setDeploymentMessage] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<'aws' | 'azure' | 'gcp' | null>(null);
  const [teamRole, setTeamRole] = useState<{ roleArn: string; externalId: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize Socket.IO connection for deployment updates.
  useEffect(() => {
    const socket = io('https://OpsConverge.com', {
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
>>>>>>> local
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  // Handle "Back" button
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Handle final "Finish Deployment" - one-click CloudFormation approach
  const handleFinishDeployment = async () => {
    try {
      setError(null);

      // You can incorporate the AWS account ID if your template has a parameter for it:
      // e.g. param_AWSAccountId=<awsAccountId> in the URL
      
      // 2. Generate an External ID (simple random)
      const randomExternalId = Math.random().toString(36).substring(2, 10);

      // 1. Define your region, stack name, and the template S3 URL
      const region = 'us-east-2';
      const stackName = `MyStack-${Date.now()}`;
      const rawTemplateUrl = `https://opsconverge01.s3.${region}.amazonaws.com/Basic.yaml`;

<<<<<<< working
      // 2. URL-encode the template URL
      const encodedTemplateUrl = encodeURIComponent(rawTemplateUrl);
=======
      // Include TeamID in the Quick Create URL
      const quickCreateUrl = `https://console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/quickcreate?templateUrl=${encodedTemplateUrl}&stackName=${stackName}&param_RoleArn=${encodeURIComponent(teamRole.roleArn)}&param_ExternalID=${teamRole.externalId}&param_TeamID=${encodeURIComponent(team.id)}&capabilities=CAPABILITY_IAM`;
>>>>>>> local

      // Example dynamic external ID
      const externalID = Math.random().toString(36).substring(2, 10);

      // 5. Build the CF launch URL
      // Build the Quick Create URL
      const quickCreateUrl = `https://console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/quickcreate?templateUrl=${encodedTemplateUrl}&stackName=${stackName}&param_ExternalID=${externalID}&capabilities=CAPABILITY_IAM`;
    
      // 4. Open in a new tab/window
      window.open(quickCreateUrl, '_blank');
      
      // 5. Show success message and move to step 5
      toast.success('Opened AWS CloudFormation console in a new tab!');
      setCurrentStep(5);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred.';
      setError(message);
      toast.error(message);
    }
  };

  // Render content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <p>
              Welcome to the Infrastructure Deployment Wizard for team
              <strong> {team.name}</strong>.
            </p>
            <p>Click "Next" to begin.</p>
          </div>
        );
      case 2:
        return (
          <div>
            <label htmlFor="provider-select" className="block mb-2 font-medium">
              Select Cloud Provider:
            </label>
            <select
              id="provider-select"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-3 py-2 border rounded w-full"
            >
              <option value="">-- Select Cloud Provider --</option>
              {cloudProviderOptions.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>
        );
      case 3:
        return (
          <div>
            <label htmlFor="template-select" className="block mb-2 font-medium">
              Select Deployment Template:
            </label>
            <select
              id="template-select"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-2 border rounded w-full"
            >
              <option value="">-- Select Template --</option>
              {templateOptions.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        );
      case 4:
        return (
          <div>
            <label htmlFor="aws-account-id" className="block mb-2 font-medium">
              Enter AWS Account ID (Optional Demo):
            </label>
            <input
              id="aws-account-id"
              type="text"
              placeholder="*********"
              value={awsAccountId}
              onChange={(e) => setAwsAccountId(e.target.value)}
              className="px-3 py-2 border rounded w-full"
            />
            <p className="text-sm text-gray-600 mt-2">
              (In a real scenario, you might pass this as a parameter to your template.)
            </p>
          </div>
        );
      case 5:
        return (
          <div>
            <p>Deployment initiated!</p>
            <p>The AWS CloudFormation console has been opened in a new tab.</p>
            <p>Your deployment status will be updated in real time below:</p>
            <DeploymentStatus />
          </div>
        );
      default:
        return null;
    }
  };

  // Render navigation buttons
  const renderButtons = () => {
    // Steps 1 to 3: "Back" (if not step 1) + "Next"
    if (currentStep >= 1 && currentStep <= 3) {
      return (
        <div className="flex justify-between mt-4">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      );
    }

    // Step 4: "Back" + "Finish Deployment (Launch Stack)"
    if (currentStep === 4) {
      return (
        <div className="flex justify-between mt-4">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Back
          </button>
          <button
            onClick={handleFinishDeployment}
            className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Launch Stack
          </button>
        </div>
      );
    }

    // Step 5: "Return to Dashboard" or whatever final action you want
    if (currentStep === 5) {
      return (
        <div className="flex justify-end mt-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }
  };

  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Deploy Infrastructure Flow</h2>
      {renderStepContent()}
      {renderButtons()}

      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-4">
        <p>Step {currentStep} of 5</p>
      </div>
    </div>
  );
};

export default DeployInfraFlow;
<<<<<<< working

=======
>>>>>>> local
