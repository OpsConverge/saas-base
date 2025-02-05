// File: components/team/DeployInfraFlow.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface DeployInfraFlowProps {
  team: {
    id: string;
    name: string;
  };
}

const DeployInfraFlow: React.FC<DeployInfraFlowProps> = ({ team }) => {
  // Define step numbers:
  // 1 = Intro, 2 = Select Provider, 3 = Select Template, 4 = Authenticate, 5 = Finish Deployment
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [deploying, setDeploying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Options for cloud providers and templates.
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

  // Detect if the user has just been authenticated by checking for a query parameter.
  useEffect(() => {
    if (router.query.authenticated === 'true') {
      // Move to step 5 (Finish Deployment) if authenticated.
      setCurrentStep(5);
    }
  }, [router.query.authenticated]);

  const handleNext = () => {
    // Validation for steps.
    if (currentStep === 2 && !selectedProvider) {
      alert('Please select a cloud provider.');
      return;
    }
    if (currentStep === 3 && !selectedTemplate) {
      alert('Please select a deployment template.');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step 4: When the user clicks "Next & Authenticate", redirect to the cloud provider OAuth URL.
  const handleAuthenticate = () => {
    // Construct the OAuth URL.
    const clientId = process.env.NEXT_PUBLIC_CLOUD_CLIENT_ID; // Set per provider
    const redirectUri = encodeURIComponent(`${window.location.origin}/teams/${team.id}/infrastructure`);
    const scope = 'openid profile email';
    // Pass state data (template, provider, teamId) for use after authentication.
    const state = JSON.stringify({ template: selectedTemplate, provider: selectedProvider, teamId: team.id });
    // Example OAuth URL (replace with the actual endpoint for your provider).
    const oauthUrl = `https://example-oauth.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
    
    // Redirect the user.
    window.location.href = oauthUrl;
  };

  // Step 5: After authentication, the user clicks "Finish Deployment" to trigger the deployment.
  const handleFinishDeployment = async () => {
    setDeploying(true);
    setError(null);
    try {
      // Trigger your API route to dispatch the GitHub Action workflow.
      // For example, POST to /api/trigger-deployment with provider, template, and teamId.
      const res = await fetch('/api/trigger-deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          teamId: team.id,
          provider: selectedProvider,
          // If using temporary credentials or additional info, include them here.
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Deployment failed.');
      }
      alert('Deployment triggered successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeploying(false);
    }
  };

  // Render the content based on the current step.
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <p>
              Welcome to the Infrastructure Deployment Wizard for team <strong>{team.name}</strong>.
            </p>
            <p>Click "Next" to get started.</p>
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
                <option key={template.id} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        );
      case 4:
        return (
          <div>
            <p>
              You have selected <strong>{selectedProvider}</strong> as your cloud provider and{' '}
              <strong>{selectedTemplate}</strong> as your deployment template.
            </p>
            <p>Click "Next & Authenticate" to be redirected for authentication.</p>
          </div>
        );
      case 5:
        return (
          <div>
            <p>
              Authentication successful! Click "Finish Deployment" to trigger deployment to your cloud environment.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Render buttons based on the current step.
  const renderButtons = () => {
    // For steps 1-3, show "Back" and "Next" buttons.
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
    // For step 4, show "Back" and "Next & Authenticate" buttons.
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
            onClick={handleAuthenticate}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Next & Authenticate
          </button>
        </div>
      );
    }
    // For step 5, show "Back" and "Finish Deployment" buttons.
    if (currentStep === 5) {
      return (
        <div className="flex justify-between mt-4">
          <button
            onClick={handleBack}
            disabled={deploying}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Back
          </button>
          <button
            onClick={handleFinishDeployment}
            disabled={deploying}
            className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {deploying ? 'Deploying...' : 'Finish Deployment'}
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
