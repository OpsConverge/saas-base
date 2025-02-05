// File: components/team/DeployInfraFlow.tsx
import React, { useState } from 'react';

interface DeployInfraFlowProps {
  team: {
    id: string;
    name: string;
  };
}

const DeployInfraFlow: React.FC<DeployInfraFlowProps> = ({ team }) => {
  // currentStep: 1 = intro, 2 = select provider, 3 = select template, 4 = authenticate & trigger
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

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

  const handleNext = () => {
    // Validate required fields in each step
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
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Step 4: When reaching the final step, redirect to authenticate.
  if (currentStep === 4) {
    const redirectUrl = `/auth/cloud?provider=${selectedProvider}&template=${encodeURIComponent(
      selectedTemplate
    )}&teamId=${team.id}`;
    // Optionally, show a brief message before redirecting.
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2000);
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p>You are being redirected to {selectedProvider} for authentication.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Deploy Infrastructure Flow</h2>
      <div>
        {currentStep === 1 && (
          <div>
            <p>Welcome to the Infrastructure Deployment Wizard for team <strong>{team.name}</strong>.</p>
            <p>Click "Next" to get started.</p>
          </div>
        )}
        {currentStep === 2 && (
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
        )}
        {currentStep === 3 && (
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
        )}
      </div>
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
          {currentStep === 3 ? 'Next & Authenticate' : 'Next'}
        </button>
      </div>
      <div className="mt-4">
        <p>Step {currentStep} of 4</p>
      </div>
    </div>
  );
};

export default DeployInfraFlow;
