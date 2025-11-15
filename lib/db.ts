import Dexie, { Table } from 'dexie';
import { Publisher, Participation, Workbook, Rule } from '../types';
import { calculatePartDate } from './utils';

// This is a more robust way to define the Dexie database, avoiding potential
// issues with subclassing in some build environments.
const db = new Dexie('CongregationDB') as Dexie & {
  publishers: Table<Publisher, string>;
  participations: Table<Participation, string>;
  workbooks: Table<Workbook, string>;
  rules: Table<Rule, string>;
};

db.version(1).stores({
  publishers: 'id, name',
  participations: 'id, week, publisherName',
  workbooks: 'id, name',
});

// Added in a new version to avoid breaking existing installations
db.version(2).stores({
  publishers: 'id, name',
  participations: 'id, week, publisherName',
  workbooks: 'id, name',
  rules: 'id, isActive',
});

// FIX: Add a new database version to migrate existing data.
// This ensures that all participation records have the 'date' field,
// which is crucial for the sorting functionality to work correctly.
// It also adds an index on the 'date' field for better performance.
db.version(3).stores({
  publishers: 'id, name',
  participations: 'id, week, publisherName, date',
  workbooks: 'id, name',
  rules: 'id, isActive',
}).upgrade(tx => {
  // This upgrade function will run for any user who has an older version of the DB.
  return tx.table('participations').toCollection().modify(participation => {
    // If a participation record from an older version is missing the 'date' field,
    // we calculate and add it based on its 'week' string.
    if (!participation.date) {
      participation.date = calculatePartDate(participation.week);
    }
  });
});

// NOVO: Versão 4 para adicionar privilégios por seção e disponibilidade.
db.version(4).stores({
  // O esquema permanece o mesmo, a mudança é nos dados.
  publishers: 'id, name',
  participations: 'id, week, publisherName, date',
  workbooks: 'id, name',
  rules: 'id, isActive',
}).upgrade(tx => {
  return tx.table('publishers').toCollection().modify(publisher => {
    // Adiciona privilegesBySection com lógica padrão se não existir.
    if (!publisher.privilegesBySection) {
      const isAppointed = ['Ancião', 'Servo Ministerial'].includes(publisher.condition);
      
      if (isAppointed) {
        // Anciãos e SMs podem participar em todas as seções por padrão.
        publisher.privilegesBySection = {
          canParticipateInTreasures: true,
          canParticipateInMinistry: true,
          canParticipateInLife: true,
        };
      } else if (publisher.gender === 'sister') {
        // Irmãs (não designadas) só no Ministério.
        publisher.privilegesBySection = {
          canParticipateInTreasures: false,
          canParticipateInMinistry: true,
          canParticipateInLife: false,
        };
      } else { // Irmãos (não designados)
        // Podem participar em todas, mas as regras da IA farão o filtro fino.
        publisher.privilegesBySection = {
          canParticipateInTreasures: true,
          canParticipateInMinistry: true,
          canParticipateInLife: true,
        };
      }
    }
    // Adiciona availability com valor padrão se não existir.
    if (!publisher.availability) {
      publisher.availability = { mode: 'always', exceptionDates: [] };
    }
  });
});

// NOVO: Versão 5 para adicionar o status de atuante.
db.version(5).stores({
  publishers: 'id, name',
  participations: 'id, week, publisherName, date',
  workbooks: 'id, name',
  rules: 'id, isActive',
}).upgrade(tx => {
  return tx.table('publishers').toCollection().modify(publisher => {
    // Adiciona isServing com valor padrão `true` para registros existentes.
    if (publisher.isServing === undefined) {
      publisher.isServing = true;
    }
  });
});

// NOVO: Versão 6 para adicionar faixa etária, parentesco e status de ajudante.
db.version(6).stores({
  publishers: 'id, name',
  participations: 'id, week, publisherName, date',
  workbooks: 'id, name',
  rules: 'id, isActive',
}).upgrade(tx => {
  return tx.table('publishers').toCollection().modify(publisher => {
    // Adiciona os novos campos com valores padrão seguros.
    if (publisher.ageGroup === undefined) {
      publisher.ageGroup = 'Adulto';
    }
    if (publisher.parentIds === undefined) {
      publisher.parentIds = [];
    }
    if (publisher.isHelperOnly === undefined) {
      publisher.isHelperOnly = false;
    }
    if (publisher.canPairWithNonParent === undefined) {
      publisher.canPairWithNonParent = false;
    }
  });
});


export { db };