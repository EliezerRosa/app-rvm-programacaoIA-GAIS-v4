

import React from 'react';
import { Participation, ParticipationType } from '../types';
import { PencilIcon, TrashIcon } from './icons';

interface ParticipationTableProps {
  participations: Participation[];
  onEdit: (participation: Participation) => void;
  onDelete: (participation: Participation) => void;
}

const ParticipationTable: React.FC<ParticipationTableProps> = ({ participations, onEdit, onDelete }) => {
  
  const getTypeChip = (type: ParticipationType) => {
    switch (type) {
        case ParticipationType.TESOUROS:
            return { className: 'chip chip--primary', accent: 'accent--indigo' };
        case ParticipationType.MINISTERIO:
            return { className: 'chip chip--amber', accent: 'accent--amber' };
        case ParticipationType.VIDA_CRISTA:
            return { className: 'chip chip--rose', accent: 'accent--rose' };
        case ParticipationType.ORACAO_INICIAL:
        case ParticipationType.ORACAO_FINAL:
            return { className: 'chip chip--success', accent: 'accent--green' };
        case ParticipationType.PRESIDENTE:
        case ParticipationType.DIRIGENTE:
            return { className: 'chip chip--purple', accent: 'accent--purple' };
        default:
            return { className: 'chip', accent: 'accent--neutral' };
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'Data não informada';
    try {
        return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch (error) {
        return date;
    }
  };

  if (participations.length === 0) {
    return (
        <div className="empty-state">
            <p>Nenhuma participação lançada ainda. Use o botão “Adicionar Participação”.</p>
        </div>
    );
  }

  return (
    <div className="participation-feed">
        {participations.map((p) => {
            const typeChip = getTypeChip(p.type);
            return (
                <article key={p.id} className={`participation-card glass-panel ${typeChip.accent}`}>
                    <div className="participation-card__header">
                        <div>
                            <p className="participation-card__title">{p.partTitle}</p>
                            <p className="participation-card__meta">{p.week} · {formatDate(p.date)}</p>
                        </div>
                        <span className={typeChip.className}>{p.type}</span>
                    </div>
                    <div className="participation-card__body">
                        <div>
                            <p className="participation-card__publisher">{p.publisherName}</p>
                            <p className="participation-card__notes">Designação gerenciada automaticamente a partir das regras e históricos.</p>
                        </div>
                        <div className="card-actions">
                            <button onClick={() => onEdit(p)} className="icon-button" aria-label={`Editar participação de ${p.publisherName}`}>
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => onDelete(p)} className="icon-button icon-button--danger" aria-label={`Excluir participação de ${p.publisherName}`}>
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </article>
            );
        })}
    </div>
  );
};

export default ParticipationTable;