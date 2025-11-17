

import React from 'react';
import { Publisher } from '../types';
import { PencilIcon, TrashIcon, UserCircleIcon } from './icons';

interface PublisherTableProps {
  publishers: Publisher[];
  onEdit: (publisher: Publisher) => void;
  onDelete: (publisher: Publisher) => void;
}

const PublisherTable: React.FC<PublisherTableProps> = ({ publishers, onEdit, onDelete }) => {

  const formatPhone = (phone: string) => {
    if (!phone) return 'Não informado';
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };
  
  const getGenderAccent = (gender: 'brother' | 'sister') => {
      return gender === 'brother'
        ? 'publisher-avatar is-brother'
        : 'publisher-avatar is-sister';
  };

  const getConditionChip = (condition: string) => {
    if (['Ancião', 'Servo Ministerial'].includes(condition)) {
        return 'chip chip--primary';
    }
    return 'chip chip--success';
  };

  const getAgeChip = (ageGroup: string) => {
    switch (ageGroup) {
      case 'Jovem':
        return 'chip chip--youth';
      case 'Criança':
        return 'chip chip--child';
      default:
        return null;
    }
  };

  const defaultPrivileges = {
    canGiveTalks: false,
    canConductCBS: false,
    canReadCBS: false,
    canPray: false,
    canPreside: false,
  };

  const defaultSectionPrivileges = {
    canParticipateInTreasures: false,
    canParticipateInMinistry: false,
    canParticipateInLife: false,
  };

  if (publishers.length === 0) {
    return (
      <div className="empty-state">
        <p>Nenhum publicador cadastrado ainda. Utilize o botão “Adicionar Publicador” para começar.</p>
      </div>
    );
  }

  return (
    <div className="publisher-grid">
        {publishers.map((publisher) => {
          const privileges = publisher.privileges ?? defaultPrivileges;
          const sectionPrivileges = publisher.privilegesBySection ?? defaultSectionPrivileges;
          return (
            <article key={publisher.id} className="publisher-card glass-panel">
                <div className="publisher-card__header">
                    <div className="publisher-card__identity">
                        <span className={getGenderAccent(publisher.gender)}>
                            <UserCircleIcon />
                        </span>
                        <div>
                            <p className="publisher-card__name">
                                {publisher.name}
                                {!publisher.isServing && <span className="chip chip--warning">Não atuante</span>}
                            </p>
                            <p className="publisher-card__meta">{publisher.gender === 'brother' ? 'Irmão' : 'Irmã'} · {publisher.phone ? formatPhone(publisher.phone) : 'Sem telefone'}</p>
                        </div>
                    </div>
                    <div className="card-actions">
                        <button onClick={() => onEdit(publisher)} className="icon-button" aria-label={`Editar ${publisher.name}`}>
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => onDelete(publisher)} className="icon-button icon-button--danger" aria-label={`Excluir ${publisher.name}`}>
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="publisher-card__chips">
                    <span className={getConditionChip(publisher.condition)}>{publisher.condition}</span>
                    {getAgeChip(publisher.ageGroup) && <span className={getAgeChip(publisher.ageGroup) as string}>{publisher.ageGroup}</span>}
                    {publisher.isHelperOnly && <span className="chip">Apoio</span>}
                </div>
                <div className="publisher-card__privileges">
                    <div>
                        <p className="publisher-card__section">Privilégios gerais</p>
                        <ul>
                        <li>{privileges.canGiveTalks ? '🎤 Discursos' : '— Discursos'}</li>
                        <li>{privileges.canPray ? '🙏 Orações' : '— Orações'}</li>
                        <li>{privileges.canPreside ? '🧭 Presidir' : '— Presidir'}</li>
                        </ul>
                    </div>
                    <div>
                        <p className="publisher-card__section">Seções da reunião</p>
                        <ul>
                        <li>{sectionPrivileges.canParticipateInTreasures ? '💎 Tesouros' : '— Tesouros'}</li>
                        <li>{sectionPrivileges.canParticipateInMinistry ? '🛠 Ministério' : '— Ministério'}</li>
                        <li>{sectionPrivileges.canParticipateInLife ? '🌱 Vida Cristã' : '— Vida Cristã'}</li>
                        </ul>
                    </div>
                </div>
                </article>
              );})}
    </div>
  );
};

export default PublisherTable;