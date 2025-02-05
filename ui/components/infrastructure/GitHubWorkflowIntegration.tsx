import { useTranslation } from 'next-i18next';

const GitHubWorkflowIntegration = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <h2>{t('github-workflow-integration')}</h2>
      <div className="space-y-4">
        <input type="text" placeholder={t('enter-github-token')} className="p-2 border rounded" />
        <button className="p-2 bg-blue-500 text-white rounded">{t('start-deployment')}</button>
      </div>
    </div>
  );
};

export default GitHubWorkflowIntegration;