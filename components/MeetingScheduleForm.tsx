import React, { useState, useEffect } from 'react';
import { MeetingData, Participation, ParticipationType, Publisher } from '../types';
import { RenderablePart, getOrderedAndPairedParts } from '../lib/scheduleUtils';

interface MeetingScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meetingData: MeetingData) => void;
  scheduleToEdit: MeetingData | null;
  publishers: Publisher[];
}

const MeetingScheduleForm: React.FC<MeetingScheduleFormProps> = ({ isOpen, onClose, onSave, scheduleToEdit, publishers }) => {
  const [formData, setFormData] = useState<Participation[]>([]);
  const [orderedPartsForForm, setOrderedPartsForForm] = useState<RenderablePart[]>([]);

  useEffect(() => {
    if (scheduleToEdit) {
      const partsCopy = JSON.parse(JSON.stringify(scheduleToEdit.parts));
      setFormData(partsCopy);

      const president = partsCopy.find((p: Participation) => p.type === ParticipationType.PRESIDENTE);
      const openingPrayer = partsCopy.find((p: Participation) => p.type === ParticipationType.ORACAO_INICIAL);
      const closingPrayer = partsCopy.find((p: Participation) => p.type === ParticipationType.ORACAO_FINAL);
      
      const mainParts = getOrderedAndPairedParts(partsCopy, publishers);

      const displayOrder: (Participation | undefined)[] = [
          president,
          openingPrayer,
          ...mainParts,
          closingPrayer
      ];
      
      const filteredOrder = displayOrder.filter((p): p is Participation => !!p);
      const uniqueDisplayOrder = Array.from(new Map(filteredOrder.map(item => [item.id, item])).values());
      
      setOrderedPartsForForm(uniqueDisplayOrder as RenderablePart[]);

    } else {
      setFormData([]);
      setOrderedPartsForForm([]);
    }
  }, [scheduleToEdit, publishers]);

  const handleParticipantChange = (partId: string, newPublisherName: string) => {
    setFormData(prevParts =>
      prevParts.map(part =>
        part.id === partId ? { ...part, publisherName: newPublisherName } : part
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleToEdit) {
      onSave({ week: scheduleToEdit.week, parts: formData });
    }
    onClose();
  };
  
  if (!isOpen || !scheduleToEdit) return null;

  const getPairLabels = (part: RenderablePart): [string, string] => {
    if (part.type === ParticipationType.DIRIGENTE) {
        return ["Dirigente", "Leitor"];
    }
    return ["Estudante", "Ajudante"];
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl m-4 flex flex-col" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Editar Pauta - {scheduleToEdit.week}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
            <div className="p-6 flex-grow overflow-y-auto">
              <div className="space-y-4">
                  {orderedPartsForForm.map(part => {
                      // Encontra a versão mais recente da parte no estado 'formData'
                      const currentPartState = formData.find(p => p.id === part.id) || part;
                      const currentPairState = part.pair ? formData.find(p => p.id === part.pair!.id) : undefined;

                      if (part.pair && currentPairState) {
                          const [mainLabel, pairLabel] = getPairLabels(part);
                          return (
                              <div key={part.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                                  <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 truncate">{part.partTitle}</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                      <div>
                                          <label htmlFor={`part-${part.id}`} className="block text-xs font-medium text-gray-500 dark:text-gray-400">{mainLabel}</label>
                                          <input
                                              list="publisher-list"
                                              id={`part-${part.id}`}
                                              type="text"
                                              value={currentPartState.publisherName}
                                              onChange={(e) => handleParticipantChange(part.id, e.target.value)}
                                              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm text-black"
                                          />
                                      </div>
                                      <div>
                                          <label htmlFor={`part-${part.pair.id}`} className="block text-xs font-medium text-gray-500 dark:text-gray-400">{pairLabel}</label>
                                          <input
                                              list="publisher-list"
                                              id={`part-${part.pair.id}`}
                                              type="text"
                                              value={currentPairState.publisherName}
                                              onChange={(e) => handleParticipantChange(part.pair.id, e.target.value)}
                                              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm text-black"
                                          />
                                      </div>
                                  </div>
                              </div>
                          )
                      }
                      return (
                          <div key={part.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                              <label htmlFor={`part-${part.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                  { part.type === ParticipationType.ORACAO_INICIAL ? `Oração Inicial` : part.type === ParticipationType.ORACAO_FINAL ? `Oração Final` : `${part.partTitle}` }
                              </label>
                              <input
                                  list="publisher-list"
                                  id={`part-${part.id}`}
                                  type="text"
                                  value={currentPartState.publisherName}
                                  onChange={(e) => handleParticipantChange(part.id, e.target.value)}
                                  className="block w-full px-3 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm text-black"
                              />
                          </div>
                      );
                  })}
                  <datalist id="publisher-list">
                      {publishers.map(p => <option key={p.id} value={p.name} />)}
                  </datalist>
              </div>
            </div>
            <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Salvar Alterações
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingScheduleForm;