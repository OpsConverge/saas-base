// components/DeploymentStatus.tsx
import React from 'react';

interface DeploymentStatusProps {
  status: string;
  message: string;
}

const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ status, message }) => {
  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-medium mb-2">Deployment Status</h3>
      <div className="space-y-2">
        <p>
          <span className="font-medium">Status:</span>{' '}
          <span className={status === 'CREATE_COMPLETE' ? 'text-green-600' : status === 'FAILED' ? 'text-red-600' : 'text-blue-600'}>
            {status}
          </span>
        </p>
        <p>
          <span className="font-medium">Message:</span>{' '}
          <span className="text-gray-600">{message}</span>
        </p>
      </div>
    </div>
  );
};

export default DeploymentStatus;
