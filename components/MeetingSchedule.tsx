import React from 'react';
import { MeetingData, ParticipationType, Publisher } from '../types';
import { EyeIcon, PencilIcon } from './icons';
import { parseWeekDate } from '../lib/utils';
import { RenderablePart, getOrderedAndPairedParts } from '../lib/scheduleUtils';

interface MeetingScheduleProps {
  scheduleData: MeetingData[];
  publishers: Publisher[];
  onEditWeek: (meetingData: MeetingData) => void;
  onOpenPrintableView: (meetingData: MeetingData) => void;
}

const MeetingSchedule: React.FC<MeetingScheduleProps> = ({ scheduleData, publishers, onEditWeek, onOpenPrintableView }) => {

    const sortedSchedule = [...scheduleData].sort((a, b) => {
        return parseWeekDate(b.week).getTime() - parseWeekDate(a.week).getTime();
    });
    
    const renderPart = (part: RenderablePart, partNumber: number) => {
        let title = part.partTitle;
        let name = part.publisherName;
        const durationText = part.duration ? `(${part.duration} min)` : '';
        
        if (part.type === ParticipationType.DIRIGENTE) title = "Estudo Bíblico de Congregação";

        if(part.pair) {
            if (part.type === ParticipationType.DIRIGENTE) {
                name = `${part.publisherName} (Dirigente) / ${part.pair.publisherName} (Leitor)`;
            } else { // Assumed student/helper
                name = `${part.publisherName} / ${part.pair.publisherName}`;
            }
        }

        return (
             <div key={part.id} className="grid grid-cols-2 gap-4 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 items-baseline">
                <span className="text-sm text-gray-800 dark:text-gray-300">{partNumber}. {title}</span>
                <div className="text-sm text-gray-600 dark:text-gray-400 justify-self-end text-right">
                    <span className="mr-4">{name}</span>
                    <span className="text-gray-400 dark:text-gray-500 w-12 inline-block text-right">{durationText}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {sortedSchedule.map((meeting) => {
                const mainParts = getOrderedAndPairedParts(meeting.parts, publishers);
                const president = meeting.parts.find(p => p.type === ParticipationType.PRESIDENTE);
                const openingPrayer = meeting.parts.find(p => p.type === ParticipationType.ORACAO_INICIAL);
                const closingPrayer = meeting.parts.find(p => p.type === ParticipationType.ORACAO_FINAL);
                
                const treasuresParts = mainParts.filter(p => p.type === ParticipationType.TESOUROS);
                const ministryParts = mainParts.filter(p => p.type === ParticipationType.MINISTERIO);
                const lifeParts = mainParts.filter(p => p.type === ParticipationType.VIDA_CRISTA || p.type === ParticipationType.DIRIGENTE);
                
                let partCounter = 1;

                return (
                    <div key={meeting.week} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{meeting.week}</h3>
                                {president && <p className="text-md text-gray-600 dark:text-gray-400">Presidente: {president.publisherName}</p>}
                            </div>
                             <div className="flex items-center space-x-2">
                                <button onClick={() => onOpenPrintableView(meeting)} className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500" title="Visualizar Pauta">
                                    <EyeIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => onEditWeek(meeting)} className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-500" title="Editar Pauta">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                           {openingPrayer && <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-200 dark:border-gray-700 font-medium"><span>Oração Inicial:</span><span className="justify-self-end text-right">{openingPrayer.publisherName}</span></div>}
                           
                           {treasuresParts.length > 0 && (
                               <div>
                                   <h4 className="font-bold text-lg text-white bg-[#4A5568] dark:bg-blue-900/50 rounded-md px-3 py-1 mb-2">TESOUROS DA PALAVRA DE DEUS</h4>
                                   {treasuresParts.map(p => renderPart(p, partCounter++))}
                               </div>
                           )}
                           
                           {ministryParts.length > 0 && (
                               <div>
                                   <h4 className="font-bold text-lg text-white bg-[#D69E2E] dark:bg-yellow-900/50 rounded-md px-3 py-1 mt-4 mb-2">FAÇA SEU MELHOR NO MINISTÉRIO</h4>
                                   {ministryParts.map(p => renderPart(p, partCounter++))}
                               </div>
                           )}

                           {lifeParts.length > 0 && (
                               <div>
                                   <h4 className="font-bold text-lg text-white bg-[#C53030] dark:bg-red-900/50 rounded-md px-3 py-1 mt-4 mb-2">NOSSA VIDA CRISTÃ</h4>
                                   {lifeParts.map(p => renderPart(p, partCounter++))}
                               </div>
                           )}

                           {closingPrayer && <div className="grid grid-cols-2 gap-4 py-2 border-t border-gray-200 dark:border-gray-700 mt-4 font-medium"><span>Oração Final:</span><span className="justify-self-end text-right">{closingPrayer.publisherName}</span></div>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MeetingSchedule;