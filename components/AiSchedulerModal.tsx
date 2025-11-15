import React, { useState } from 'react';
import { Workbook } from '../types';

interface AiSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (workbook: Workbook) => void;
  workbooks: Workbook[];
  isGenerating: boolean;
}

const AiSchedulerModal: React.FC<AiSchedulerModalProps> = ({ isOpen, onClose, onGenerate, workbooks, isGenerating }) => {
  const [selectedWorkbookId, setSelectedWorkbookId] = useState<string>('');

  if (!isOpen) return null;

  const futureWorkbooks = workbooks.filter(w => new Date(w.uploadDate) > new Date());

  const handleGenerate = () => {
    const workbook = futureWorkbooks.find(w => w.id === selectedWorkbookId);
    if (workbook) {
      onGenerate(workbook);
    } else {
      alert("Por favor, selecione uma apostila.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 flex flex-col" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gerar Pauta com IA</h2>
        </div>
        <div className="p-6 flex-grow overflow-y-auto space-y-4">
          <div>
            <label htmlFor="workbook-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Selecione a Apostila Futura
            </label>
            <select
              id="workbook-select"
              value={selectedWorkbookId}
              onChange={(e) => setSelectedWorkbookId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white text-black focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm rounded-md"
            >
              <option value="" disabled>Escolha uma apostila...</option>
              {futureWorkbooks.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          {isGenerating && (
            <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-300">Gerando designações... Isso pode levar um momento.</p>
            </div>
          )}
        </div>
        <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 flex justify-end space-x-3">
          <button type="button" onClick={onClose} disabled={isGenerating} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={handleGenerate} disabled={!selectedWorkbookId || isGenerating} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed">
            {isGenerating ? 'Processando...' : 'Gerar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiSchedulerModal;