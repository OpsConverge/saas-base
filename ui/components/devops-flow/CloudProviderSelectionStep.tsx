import { useTranslation } from 'next-i18next';

const CloudProviderSelectionStep = ({
  onNext,
  onBack,
  selectedProvider,
  setSelectedProvider,
}: {
  onNext: () => void;
  onBack: () => void;
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('select-cloud-provider')}</h2>
      <select
        value={selectedProvider}
        onChange={(e) => setSelectedProvider(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">{t('select-provider')}</option>
        <option value="aws">AWS</option>
        <option value="azure">Azure</option>
        <option value="gcp">GCP</option>
      </select>
      <div className="flex space-x-4">
        <button onClick={onBack} className="p-2 bg-gray-500 text-white rounded">
          {t('back')}
        </button>
        <button
          onClick={onNext}
          disabled={!selectedProvider}
          className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
};

export default CloudProviderSelectionStep;