import { useState } from 'react';
import IntroStep from '@/components/devops-flow/IntroStep';
import CloudProviderSelectionStep from '@/components/devops-flow/CloudProviderSelectionStep';
import TemplateSelectionStep from '@/components/devops-flow/TemplateSelectionStep';
import AuthenticateStep from '@/components/devops-flow/AuthenticateStep';
import FinishDeploymentStep from '@/components/devops-flow/FinishDeploymentStep';

const DevOpsFlow = () => {
  const [step, setStep] = useState<number>(1);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleAuthenticate = () => {
    // Redirect to AWS OAuth URL (example)
    const awsOAuthUrl = `https://aws.amazon.com/oauth?client_id=YOUR_CLIENT_ID&redirect_uri=${window.location.origin}/teams/team-slug/devops`;
    window.location.href = awsOAuthUrl;
  };

  const handleFinishDeployment = async () => {
    // Trigger GitHub Action workflow via API
    const response = await fetch('/api/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: selectedProvider, template: selectedTemplate }),
    });

    if (response.ok) {
      alert('Deployment started successfully!');
    } else {
      alert('Failed to start deployment.');
    }
  };

  return (
    <div className="p-6">
      {step === 1 && <IntroStep onNext={handleNext} />}
      {step === 2 && (
        <CloudProviderSelectionStep
          onNext={handleNext}
          onBack={handleBack}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
        />
      )}
      {step === 3 && (
        <TemplateSelectionStep
          onNext={handleNext}
          onBack={handleBack}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
        />
      )}
      {step === 4 && (
        <AuthenticateStep
          onNext={handleAuthenticate}
          onBack={handleBack}
          selectedProvider={selectedProvider}
          selectedTemplate={selectedTemplate}
        />
      )}
      {step === 5 && (
        <FinishDeploymentStep
          onFinish={handleFinishDeployment}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
};

export default DevOpsFlow;