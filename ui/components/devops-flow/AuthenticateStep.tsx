import { useTranslation } from 'next-i18next';

const AuthenticateStep = ({
  onNext,
  onBack,
  selectedProvider,
  selectedTemplate,
}: {
  onNext: () => void;
  onBack: () => void;
  selectedProvider: string;
  selectedTemplate: string;
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('authentication')}</h2>
      <p>{t('selected-provider')}: {selectedProvider}</p>
      <p>{t('selected-template')}: {selectedTemplate}</p>
      <div className="flex space-x-4">
        <button onClick={onBack} className="p-2 bg-gray-500 text-white rounded">
          {t('back')}
        </button>
        <button onClick={onNext} className="p-2 bg-blue-500 text-white rounded">
          {t('next-and-authenticate')}
        </button>
      </div>
    </div>
  );
};

export default AuthenticateStep;