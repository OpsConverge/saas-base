import { useTranslation } from 'next-i18next';

const CloudProviderSelection = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <h2>{t('select-cloud-provider')}</h2>
      <div className="space-y-4">
        <button className="p-4 border rounded">{t('aws')}</button>
        <button className="p-4 border rounded">{t('azure')}</button>
        <button className="p-4 border rounded">{t('gcp')}</button>
      </div>
    </div>
  );
};

export default CloudProviderSelection;