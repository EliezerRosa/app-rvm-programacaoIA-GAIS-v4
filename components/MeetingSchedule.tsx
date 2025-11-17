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
        const durationText = part.duration ? `${part.duration} min` : '';

        if (part.type === ParticipationType.DIRIGENTE) title = 'Estudo Bíblico de Congregação';

        if (part.pair) {
            if (part.type === ParticipationType.DIRIGENTE) {
                name = `${part.publisherName} (Dirigente) · ${part.pair.publisherName} (Leitor)`;
            } else {
                name = `${part.publisherName} · ${part.pair.publisherName}`;
            }
        }

        return (
            <div key={part.id} className="schedule-row">
                <div>
                    <span className="schedule-row__label">{partNumber}. {title}</span>
                </div>
                <div className="schedule-row__meta">
                    <span className="schedule-row__person">{name}</span>
                    {durationText && <span className="schedule-row__duration">{durationText}</span>}
                </div>
            </div>
        );
    };

    const renderPrayerRow = (label: string, publisherName: string | undefined) => {
        if (!publisherName) return null;
        return (
            <div className="schedule-row schedule-row--prayer">
                <span className="schedule-row__label">{label}</span>
                <div className="schedule-row__meta">
                    <span className="schedule-row__person">{publisherName}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="schedule-stack">
            {sortedSchedule.map((meeting) => {
                const mainParts = getOrderedAndPairedParts(meeting.parts, publishers);
                const president = meeting.parts.find(p => p.type === ParticipationType.PRESIDENTE);
                const openingPrayer = meeting.parts.find(p => p.type === ParticipationType.ORACAO_INICIAL);
                const closingPrayer = meeting.parts.find(p => p.type === ParticipationType.ORACAO_FINAL);
                
                const treasuresParts = mainParts.filter(p => p.type === ParticipationType.TESOUROS);
                const ministryParts = mainParts.filter(p => p.type === ParticipationType.MINISTERIO);
                const lifeParts = mainParts.filter(p => p.type === ParticipationType.VIDA_CRISTA || p.type === ParticipationType.DIRIGENTE);
                
                let partCounter = 1;

                const sections = [
                    { key: 'treasures', label: 'TESOUROS DA PALAVRA DE DEUS', parts: treasuresParts },
                    { key: 'ministry', label: 'FAÇA SEU MELHOR NO MINISTÉRIO', parts: ministryParts },
                    { key: 'life', label: 'NOSSA VIDA CRISTÃ', parts: lifeParts }
                ];

                return (
                    <div key={meeting.week} className="schedule-card">
                        <div className="schedule-card__header">
                            <div>
                                <span className="schedule-card__eyebrow">Congregação Estância</span>
                                <h3 className="schedule-card__title">Programação da reunião do meio de semana</h3>
                                <p className="schedule-card__week">{meeting.week}</p>
                                {president && (
                                    <p className="schedule-card__meta">Presidente: {president.publisherName}</p>
                                )}
                            </div>
                            <div className="schedule-card__actions">
                                <button onClick={() => onOpenPrintableView(meeting)} className="icon-pill" title="Visualizar pauta">
                                    <EyeIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => onEditWeek(meeting)} className="icon-pill" title="Editar pauta">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="schedule-card__body">
                            {renderPrayerRow('Oração inicial', openingPrayer?.publisherName)}

                            {sections.map(section => (
                                section.parts.length ? (
                                    <section key={section.key} className={`schedule-section schedule-section--${section.key}`}>
                                        <div className="schedule-section__title">{section.label}</div>
                                        <div className="schedule-section__body">
                                            {section.parts.map(part => renderPart(part, partCounter++))}
                                        </div>
                                    </section>
                                ) : null
                            ))}

                            {renderPrayerRow('Oração final', closingPrayer?.publisherName)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MeetingSchedule;