import { useTranslation } from 'next-i18next';

const DeploymentStatus = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <h2>{t('deployment-status')}</h2>
      <div className="space-y-4">
        <p>{t('deployment-in-progress')}</p>
        <button className="p-2 bg-blue-500 text-white rounded">{t('refresh-status')}</button>
      </div>
    </div>
  );
};

export default DeploymentStatus;