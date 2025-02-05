import { useTranslation } from 'next-i18next';

const CloudProviderAuth = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <h2>{t('authenticate-to-cloud-provider')}</h2>
      <div className="space-y-4">
        <input type="text" placeholder={t('enter-token')} className="p-2 border rounded" />
        <button className="p-2 bg-blue-500 text-white rounded">{t('authenticate')}</button>
      </div>
    </div>
  );
};

export default CloudProviderAuth;