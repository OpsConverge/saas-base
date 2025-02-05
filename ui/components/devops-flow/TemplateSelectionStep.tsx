import { useTranslation } from 'next-i18next';

const TemplateSelectionStep = ({
  onNext,
  onBack,
  selectedTemplate,
  setSelectedTemplate,
}: {
  onNext: () => void;
  onBack: () => void;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('select-template')}</h2>
      <select
        value={selectedTemplate}
        onChange={(e) => setSelectedTemplate(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">{t('select-template')}</option>
        <option value="template-1">Template 1</option>
        <option value="template-2">Template 2</option>
        <option value="template-3">Template 3</option>
      </select>
      <div className="flex space-x-4">
        <button onClick={onBack} className="p-2 bg-gray-500 text-white rounded">
          {t('back')}
        </button>
        <button
          onClick={onNext}
          disabled={!selectedTemplate}
          className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
};

export default TemplateSelectionStep;