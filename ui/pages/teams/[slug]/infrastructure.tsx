import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { TeamFeature } from 'types';
import { useState } from 'react';
import CloudProviderSelection from '@/components/infrastructure/CloudProviderSelection';
import DeploymentTemplateSelection from '@/components/infrastructure/DeploymentTemplateSelection';
import CloudProviderAuth from '@/components/infrastructure/CloudProviderAuth';
import GitHubWorkflowIntegration from '@/components/infrastructure/GitHubWorkflowIntegration';
import DeploymentStatus from '@/components/infrastructure/DeploymentStatus';

const InfrastructurePage = ({ teamFeatures }: { teamFeatures: TeamFeature }) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();
  const [activeTab, setActiveTab] = useState<'cloud-provider' | 'template' | 'auth' | 'workflow' | 'status'>('cloud-provider');

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  return (
    <>
      <TeamTab activeTab="infrastructure" team={team} teamFeatures={teamFeatures} />
      <div className="space-y-6">
        <div className="flex space-x-4 border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'cloud-provider' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('cloud-provider')}
          >
            {t('cloud-provider')}
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'template' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('template')}
          >
            {t('template')}
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'auth' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('auth')}
          >
            {t('auth')}
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'workflow' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('workflow')}
          >
            {t('workflow')}
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'status' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            {t('status')}
          </button>
        </div>

        {activeTab === 'cloud-provider' && <CloudProviderSelection />}
        {activeTab === 'template' && <DeploymentTemplateSelection />}
        {activeTab === 'auth' && <CloudProviderAuth />}
        {activeTab === 'workflow' && <GitHubWorkflowIntegration />}
        {activeTab === 'status' && <DeploymentStatus />}
      </div>
    </>
  );
};

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default InfrastructurePage;