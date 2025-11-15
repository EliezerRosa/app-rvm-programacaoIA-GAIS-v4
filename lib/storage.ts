import { db } from './db';
import { Publisher, Participation, Workbook, Rule } from '../types';
import { initialPublishers } from './initialData';
import { initialParticipations } from './initialParticipations';
import { initialWorkbooks } from './initialWorkbooks';
import { initialRules } from './initialRules';

const INITIALIZATION_FLAG = 'congregationManagerInitialized';

// --- Seeding Function ---
export const initStorage = async () => {
    try {
        await db.open();

        // Check if the initial data has already been loaded.
        // If the flag is set, we don't need to do anything further.
        if (localStorage.getItem(INITIALIZATION_FLAG)) {
            return;
        }

        // Seeding logic for the very first application load
        const publisherCount = await db.publishers.count();
        if (publisherCount === 0) {
            await db.publishers.bulkAdd(initialPublishers);
        }

        const participationCount = await db.participations.count();
        if (participationCount === 0) {
            await db.participations.bulkAdd(initialParticipations);
        }
        
        const workbookCount = await db.workbooks.count();
        if (workbookCount === 0) {
            await db.workbooks.bulkAdd(initialWorkbooks);
        }

        if (db.rules) {
            const ruleCount = await db.rules.count();
            if (ruleCount === 0) {
                await db.rules.bulkAdd(initialRules);
            }
        }
        
        // After the first successful seeding, set the flag to prevent this logic from running again.
        localStorage.setItem(INITIALIZATION_FLAG, 'true');

    } catch (e) {
        console.error("Failed to initialize storage:", e);
    }
};


// --- Getter Functions ---
export const getAllPublishers = () => db.publishers.toArray();
export const getAllParticipations = () => db.participations.toArray();
export const getAllWorkbooks = () => db.workbooks.toArray();
export const getAllRules = () => db.rules ? db.rules.toArray() : Promise.resolve([]);

export const getAllData = async () => {
    const [publishers, participations, workbooks, rules] = await Promise.all([
        getAllPublishers(),
        getAllParticipations(),
        getAllWorkbooks(),
        getAllRules(),
    ]);
    return { publishers, participations, workbooks, rules };
}

// --- Publisher Functions ---
export const savePublisher = (publisher: Publisher) => {
  return db.publishers.put(publisher);
};
export const deletePublisher = (id: string) => {
  return db.publishers.delete(id);
};

// --- Participation Functions ---
export const saveParticipation = (participation: Participation) => {
  return db.participations.put(participation);
};
export const deleteParticipation = (id: string) => {
  return db.participations.delete(id);
};

// --- Workbook Functions ---
export const saveWorkbook = (workbook: Workbook) => {
  return db.workbooks.put(workbook);
};
export const deleteWorkbook = (id: string) => {
  return db.workbooks.delete(id);
};

// --- Rule Functions ---
export const saveRule = (rule: Rule) => {
    return db.rules.put(rule);
};
export const deleteRule = (id: string) => {
    return db.rules.delete(id);
};

// --- Data Management Functions ---
export const clearAllData = async () => {
    // FIX: Add a check for db.rules to prevent a runtime error if the table doesn't exist on older database schema versions.
    const promises = [
        db.publishers.clear(),
        db.participations.clear(),
        db.workbooks.clear(),
    ];
    if (db.rules) {
        promises.push(db.rules.clear());
    }
    await Promise.all(promises);
};