// File: pages/teams/[slug]/infrastructure.tsx
import { useState } from 'react';
import { Error, Loading } from '@/components/shared';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import DeployInfraFlow from '@/components/team/DeployInfraFlow';
import InfraInventory from '@/components/team/InfraInventory';
import env from '@/lib/env';
import type { TeamFeature } from 'types';

const Infrastructure = ({ teamFeatures }: { teamFeatures: TeamFeature }) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();
  const [activeTab, setActiveTab] = useState<'deploy' | 'inventory'>('deploy');

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!team) return <Error message={t('team-not-found')} />;

  return (
    <div className="p-6">
      <div className="mb-4 border-b">
        <button
          onClick={() => setActiveTab('deploy')}
          className={`px-4 py-2 mr-2 ${
            activeTab === 'deploy'
              ? 'border-b-2 border-blue-600 font-semibold'
              : 'text-gray-600'
          }`}
        >
          Deploy Infra
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 ${
            activeTab === 'inventory'
              ? 'border-b-2 border-blue-600 font-semibold'
              : 'text-gray-600'
          }`}
        >
          Infra Inventory
        </button>
      </div>
      {activeTab === 'deploy' ? (
        <DeployInfraFlow team={team} />
      ) : (
        <InfraInventory team={team} />
      )}
    </div>
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

export default Infrastructure;