// File: /components/team/DeployInfra.tsx
import React, { useState } from 'react';

interface DeployInfraProps {
  team: {
    id: string;
    name: string;
  };
}

const DeployInfra: React.FC<DeployInfraProps> = ({ team }) => {
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Simulate an API call to deploy infrastructure for the team.
      // Replace the timeout with your actual API request.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccessMessage('Infrastructure deployment initiated successfully!');
    } catch (err) {
      setError('Failed to initiate deployment. Please try again.');
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Deploy Infrastructure</h2>
      <p>Initiate a new infrastructure deployment for team: <strong>{team.name}</strong></p>

      {error && <p className="text-red-600 mt-2">{error}</p>}
      {successMessage && <p className="text-green-600 mt-2">{successMessage}</p>}

      <button
        onClick={handleDeploy}
        disabled={deploying}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {deploying ? 'Deploying...' : 'Deploy'}
      </button>
    </div>
  );
};

export default DeployInfra;
