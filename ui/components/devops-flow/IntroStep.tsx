import { useTranslation } from 'next-i18next';

const IntroStep = ({ onNext }: { onNext: () => void }) => {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('welcome-to-devops')}</h1>
      <p>{t('intro-message')}</p>
      <button onClick={onNext} className="p-2 bg-blue-500 text-white rounded">
        {t('next')}
      </button>
    </div>
  );
};

export default IntroStep;