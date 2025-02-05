import React from 'react';
import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import InfrastructureSection from '@/components/team/InfrastructureSection'; // Your Infrastructure component
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import env from '@/lib/env';
import type { TeamFeature } from 'types';

const Infrastructure = ({ teamFeatures }: { teamFeatures: TeamFeature }) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();

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
        <InfrastructureSection team={team} />
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

export default Infrastructure;
