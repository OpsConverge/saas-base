import { useTranslation } from 'next-i18next';

const DeploymentTemplateSelection = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <h2>{t('select-template')}</h2>
      <div className="space-y-4">
        <button className="p-4 border rounded">{t('template-1')}</button>
        <button className="p-4 border rounded">{t('template-2')}</button>
        <button className="p-4 border rounded">{t('template-3')}</button>
      </div>
    </div>
  );
};

export default DeploymentTemplateSelection;