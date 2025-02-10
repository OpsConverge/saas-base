import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

interface DeployInfraFlowProps {
  team: {
    id: string;
    name: string;
  };
}

const DeployInfraFlow: React.FC<DeployInfraFlowProps> = ({ team }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [awsAccountId, setAwsAccountId] = useState<string>('');
  const [deploying, setDeploying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

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
    if (currentStep === 2 && !selectedProvider) {
      toast.error('Please select a cloud provider.');
      return;
    }
    if (currentStep === 3 && !selectedTemplate) {
      toast.error('Please select a deployment template.');
      return;
    }
    if (currentStep === 4 && !awsAccountId) {
      toast.error('Please provide your AWS account ID.');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinishDeployment = async () => {
    setDeploying(true);
    setError(null);

    try {
      // Step 1: Update the IAM role's trust policy with the user's AWS account ID
      const updateResponse = await fetch('/api/aws/updateTrustPolicy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ awsAccountId }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update trust policy');
      }

      // Step 2: Assume the IAM role and get temporary credentials
      const assumeRoleResponse = await fetch('/api/aws/assumeRole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ awsAccountId }),
      });

      if (!assumeRoleResponse.ok) {
        throw new Error('Failed to assume role');
      }

      const { AccessKeyId, SecretAccessKey, SessionToken } = await assumeRoleResponse.json();

      // Step 3: Deploy the selected template using CloudFormation
      const deployResponse = await fetch('/api/aws/deployTemplate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentials: { AccessKeyId, SecretAccessKey, SessionToken },
          templateUrl: `https://your-platform-bucket.s3.amazonaws.com/${selectedTemplate}.yaml`,
        }),
      });

      if (!deployResponse.ok) {
        throw new Error('Failed to deploy template');
      }

      const { stackId } = await deployResponse.json();
      toast.success('Deployment successful!');
      setCurrentStep(5); // Move to the final step
    } catch (err) {
      setError(err.message || 'An error occurred during deployment.');
      toast.error(err.message || 'An error occurred during deployment.');
    } finally {
      setDeploying(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <p>Welcome to the Infrastructure Deployment Wizard for team <strong>{team.name}</strong>.</p>
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
              Enter AWS Account ID:
            </label>
            <input
              id="aws-account-id"
              type="text"
              placeholder="AWS Account ID"
              value={awsAccountId}
              onChange={(e) => setAwsAccountId(e.target.value)}
              className="px-3 py-2 border rounded w-full"
            />
          </div>
        );
      case 5:
        return (
          <div>
            <p>Deployment successful!</p>
            <p>Your infrastructure is now being deployed to AWS.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderButtons = () => {
    if (currentStep >= 1 && currentStep <= 3) {
      return (
        <div className="flex justify-between mt-4">
          {currentStep > 1 && (
            <button onClick={handleBack} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
              Back
            </button>
          )}
          <button onClick={handleNext} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Next
          </button>
        </div>
      );
    }
    if (currentStep === 4) {
      return (
        <div className="flex justify-between mt-4">
          <button onClick={handleBack} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
            Back
          </button>
          <button onClick={handleFinishDeployment} disabled={deploying} className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
            {deploying ? 'Deploying...' : 'Finish Deployment'}
          </button>
        </div>
      );
    }
    if (currentStep === 5) {
      return (
        <div className="flex justify-between mt-4">
          <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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

// // File: components/team/DeployInfraFlow.tsx
// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';

// interface DeployInfraFlowProps {
//   team: {
//     id: string;
//     name: string;
//   };
// }

// const DeployInfraFlow: React.FC<DeployInfraFlowProps> = ({ team }) => {
//   // Steps: 1 = Intro, 2 = Select Provider, 3 = Select Template, 4 = Authenticate, 5 = Finish Deployment
//   const [currentStep, setCurrentStep] = useState<number>(1);
//   const [selectedProvider, setSelectedProvider] = useState<string>('');
//   const [selectedTemplate, setSelectedTemplate] = useState<string>('');
//   const [deploying, setDeploying] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   // Options for cloud providers and templates.
//   // For our example, we assume AWS will use the Cognito flow.
//   const cloudProviderOptions = [
//     { id: 'aws', name: 'AWS' },
//     { id: 'azure', name: 'Azure' },
//     { id: 'gcp', name: 'GCP' },
//   ];
//   const templateOptions = [
//     { id: 'template-1', name: 'Basic Deployment' },
//     { id: 'template-2', name: 'Blue/Green Deployment' },
//     { id: 'template-3', name: 'Canary Deployment' },
//   ];

//   // Detect if the user has returned authenticated.
//   useEffect(() => {
//     if (router.query.authenticated === 'true') {
//       setCurrentStep(5);
//     }
//   }, [router.query.authenticated]);

//   const handleNext = () => {
//     if (currentStep === 2 && !selectedProvider) {
//       alert('Please select a cloud provider.');
//       return;
//     }
//     if (currentStep === 3 && !selectedTemplate) {
//       alert('Please select a deployment template.');
//       return;
//     }
//     setCurrentStep(currentStep + 1);
//   };

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <div>
//             <p>Welcome to the Infrastructure Deployment Wizard for team <strong>{team.name}</strong>.</p>
//             <p>Click "Next" to get started.</p>
//           </div>
//         );
//       case 2:
//         return (
//           <div>
//             <label htmlFor="provider-select" className="block mb-2 font-medium">
//               Select Cloud Provider:
//             </label>
//             <select
//               id="provider-select"
//               value={selectedProvider}
//               onChange={(e) => setSelectedProvider(e.target.value)}
//               className="px-3 py-2 border rounded w-full"
//             >
//               <option value="">-- Select Cloud Provider --</option>
//               {cloudProviderOptions.map((provider) => (
//                 <option key={provider.id} value={provider.id}>
//                   {provider.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         );
//       case 3:
//         return (
//           <div>
//             <label htmlFor="template-select" className="block mb-2 font-medium">
//               Select Deployment Template:
//             </label>
//             <select
//               id="template-select"
//               value={selectedTemplate}
//               onChange={(e) => setSelectedTemplate(e.target.value)}
//               className="px-3 py-2 border rounded w-full"
//             >
//               <option value="">-- Select Template --</option>
//               {templateOptions.map((template) => (
//                 <option key={template.id} value={template.name}>
//                   {template.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         );
//       case 4:
//         return (
//           <div>
//             <p>
//               You have selected <strong>{selectedProvider}</strong> as your cloud provider and{' '}
//               <strong>{selectedTemplate}</strong> as your deployment template.
//             </p>
//             <p>Click "Next & Authenticate" to be redirected for authentication.</p>
//           </div>
//         );
//       case 5:
//         return (
//           <div>
//             <p>Authentication successful!</p>
//             <p>Click "Finish Deployment" to trigger deployment to your cloud environment.</p>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   const renderButtons = () => {
//     if (currentStep >= 1 && currentStep <= 3) {
//       return (
//         <div className="flex justify-between mt-4">
//           {currentStep > 1 && (
//             <button onClick={handleBack} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
//               Back
//             </button>
//           )}
//           <button onClick={handleNext} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//             Next
//           </button>
//         </div>
//       );
//     }
//     if (currentStep === 4) {
//       return (
//         <div className="flex justify-between mt-4">
//           <button onClick={handleBack} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
//             Back
//           </button>
//           <button onClick={handleAuthenticate} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//             Next & Authenticate
//           </button>
//         </div>
//       );
//     }
//     if (currentStep === 5) {
//       return (
//         <div className="flex justify-between mt-4">
//           <button onClick={handleBack} disabled={deploying} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
//             Back
//           </button>
//           <button onClick={handleFinishDeployment} disabled={deploying} className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
//             {deploying ? 'Deploying...' : 'Finish Deployment'}
//           </button>
//         </div>
//       );
//     }
//   };

//   return (
//     <div className="p-4 border rounded shadow-sm">
//       <h2 className="text-xl font-semibold mb-4">Deploy Infrastructure Flow</h2>
//       {renderStepContent()}
//       {renderButtons()}
//       {error && <p className="mt-4 text-red-600">{error}</p>}
//       <div className="mt-4">
//         <p>Step {currentStep} of 5</p>
//       </div>
//     </div>
//   );
// };

// export default DeployInfraFlow;
