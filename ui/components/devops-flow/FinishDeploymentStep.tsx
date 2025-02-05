import { useTranslation } from 'next-i18next';

const FinishDeploymentStep = ({
  onFinish,
  isAuthenticated,
}: {
  onFinish: () => void;
  isAuthenticated: boolean;
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('finish-deployment')}</h2>
      {isAuthenticated ? (
        <p>{t('authentication-successful')}</p>
      ) : (
        <p>{t('authentication-required')}</p>
      )}
      <button
        onClick={onFinish}
        disabled={!isAuthenticated}
        className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        {t('finish-deployment')}
      </button>
    </div>
  );
};

export default FinishDeploymentStep;