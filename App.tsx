import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Publisher, Participation, Workbook, Rule, MeetingData, ParticipationType, ParticipationFormProps } from './types';
import { initStorage, getAllData, savePublisher, deletePublisher, saveParticipation, deleteParticipation, saveWorkbook, deleteWorkbook, saveRule, deleteRule, clearAllData } from './lib/storage';
import { db } from './lib/db';
import PublisherTable from './components/PublisherTable';
import PublisherForm from './components/PublisherForm';
import ParticipationTable from './components/ParticipationTable';
import ParticipationForm from './components/ParticipationForm';
import WorkbookList from './components/WorkbookList';
import WorkbookUploadModal from './components/WorkbookUploadModal';
import ConfirmationModal from './components/ConfirmationModal';
import MeetingSchedule from './components/MeetingSchedule';
import RuleManagerModal from './components/RuleManagerModal';
import { CogIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from './components/icons';
import { getScheduleHtml } from './lib/scheduleTemplate';
import { openHtmlInNewTab, generateUUID, parseWeekDate, calculatePartDate } from './lib/utils';
import MeetingScheduleForm from './components/MeetingScheduleForm';
import AiSchedulerModal from './components/AiSchedulerModal';
import AiScheduleResultsModal from './components/AiScheduleResultsModal';
import { generateAiSchedule } from './lib/aiScheduler';
import ScheduleUploadModal from './components/ScheduleUploadModal';


type Tab = 'schedule' | 'participations' | 'publishers' | 'workbooks' | 'ai-assignments';

const tabLabels: Record<Tab, string> = {
    schedule: 'Pauta',
    participations: 'Participações',
    publishers: 'Publicadores',
    workbooks: 'Apostilas',
    'ai-assignments': 'Designações por IA',
};


const App: React.FC = () => {
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [participations, setParticipations] = useState<Participation[]>([]);
    const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('schedule');

    const [isPublisherFormOpen, setIsPublisherFormOpen] = useState(false);
    const [publisherToEdit, setPublisherToEdit] = useState<Publisher | null>(null);
    const [isParticipationFormOpen, setIsParticipationFormOpen] = useState(false);
    const [participationToEdit, setParticipationToEdit] = useState<Participation | null>(null);
    const [isWorkbookModalOpen, setIsWorkbookModalOpen] = useState(false);
    const [workbookToEdit, setWorkbookToEdit] = useState<Workbook | null>(null);
    const [isRuleManagerOpen, setIsRuleManagerOpen] = useState(false);
    const [isMeetingScheduleFormOpen, setIsMeetingScheduleFormOpen] = useState(false);
    const [meetingScheduleToEdit, setMeetingScheduleToEdit] = useState<MeetingData | null>(null);
    const [isScheduleUploadModalOpen, setIsScheduleUploadModalOpen] = useState(false);
    
    // Import/Export state
    const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
    const [fileToImport, setFileToImport] = useState<File | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);
    
    // Filter & Search State
    const [scheduleWeekFilter, setScheduleWeekFilter] = useState('Todas');
    const [publisherSearchTerm, setPublisherSearchTerm] = useState('');
    const [publisherConditionFilter, setPublisherConditionFilter] = useState('Todas');
    const [publisherAgeGroupFilter, setPublisherAgeGroupFilter] = useState('Todos'); // NOVO
    const [publisherServingFilter, setPublisherServingFilter] = useState('Todos'); // NOVO
    const [participationSearchTerm, setParticipationSearchTerm] = useState('');
    const [participationPublisherFilter, setParticipationPublisherFilter] = useState('Todos');
    const [participationSortOrder, setParticipationSortOrder] = useState<'desc' | 'asc'>('desc');
    const [workbookSearchTerm, setWorkbookSearchTerm] = useState('');


    // State for AI Scheduler
    const [isAiSchedulerModalOpen, setIsAiSchedulerModalOpen] = useState(false);
    const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
    const [aiSchedulerResults, setAiSchedulerResults] = useState<{ partTitle: string; publisherName: string; reason: string; }[]>([]);
    const [targetWorkbook, setTargetWorkbook] = useState<Workbook | null>(null);


    const [itemToDelete, setItemToDelete] = useState<Publisher | Participation | Workbook | null>(null);
    const [deleteEntityType, setDeleteEntityType] = useState<'publisher' | 'participation' | 'workbook' | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            await initStorage();
            const { publishers, participations, workbooks, rules } = await getAllData();
            setPublishers(publishers);
            setParticipations(participations);
            setWorkbooks(workbooks.sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
            setRules(rules);
        } catch (error) {
            console.error("Failed to load data from storage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSavePublisher = async (publisher: Publisher) => {
        await savePublisher(publisher);
        loadData();
    };

    const handleDeletePublisher = async (publisher: Publisher) => {
        await deletePublisher(publisher.id);
        loadData();
        setItemToDelete(null);
    };
    
    const openPublisherForm = (publisher: Publisher | null) => {
        setPublisherToEdit(publisher);
        setIsPublisherFormOpen(true);
    };

    const handleSaveParticipations = async (participationsToSave: Participation[]) => {
        for (const p of participationsToSave) {
            await saveParticipation(p);
        }
        loadData();
    };
    
    const handleDeleteParticipation = async (participation: Participation) => {
        await deleteParticipation(participation.id);
        loadData();
        setItemToDelete(null);
    };
    
    const openParticipationForm = (participation: Participation | null) => {
        setParticipationToEdit(participation);
        setIsParticipationFormOpen(true);
    };
    
    const handleSaveWeekSchedule = (meetingData: MeetingData) => {
        meetingData.parts.forEach(part => {
            saveParticipation(part);
        });
        loadData();
    };

    const handleOpenPrintableSchedule = (meetingData: MeetingData) => {
        // FIX: Pass the `publishers` array to `getScheduleHtml` as it's now a required argument.
        const scheduleHtml = getScheduleHtml(meetingData, "ESTÂNCIA", publishers);
        openHtmlInNewTab(scheduleHtml);
    };

    const handleSaveWorkbook = async (workbook: Workbook) => {
        await saveWorkbook(workbook);
        loadData();
    };

    const handleDeleteWorkbook = async (workbook: Workbook) => {
        await deleteWorkbook(workbook.id);
        loadData();
        setItemToDelete(null);
    };

    const openWorkbookModal = (workbook: Workbook | null) => {
        setWorkbookToEdit(workbook);
        setIsWorkbookModalOpen(true);
    };
    
    const handleSaveRule = async (rule: Rule) => {
        await saveRule(rule);
        loadData();
    };
    
    const handleDeleteRule = async (id: string) => {
        await deleteRule(id);
        loadData();
    };

    const confirmDelete = (item: Publisher | Participation | Workbook, type: 'publisher' | 'participation' | 'workbook') => {
        setItemToDelete(item);
        setDeleteEntityType(type);
    };

    const onDeleteConfirm = () => {
        if (!itemToDelete || !deleteEntityType) return;

        if (deleteEntityType === 'publisher') {
            handleDeletePublisher(itemToDelete as Publisher);
        } else if (deleteEntityType === 'participation') {
            handleDeleteParticipation(itemToDelete as Participation);
        } else if (deleteEntityType === 'workbook') {
            handleDeleteWorkbook(itemToDelete as Workbook);
        }
    };
    
    const handleEditWeek = (meetingData: MeetingData) => {
        setMeetingScheduleToEdit(meetingData);
        setIsMeetingScheduleFormOpen(true);
    };
    
    const handleGenerateAiSchedule = async (workbook: Workbook) => {
        setIsGeneratingSchedule(true);
        setTargetWorkbook(workbook);
        try {
            const results = await generateAiSchedule(workbook, publishers, participations, rules);
            setAiSchedulerResults(results);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            alert(message);
            setAiSchedulerResults([]);
        } finally {
            setIsGeneratingSchedule(false);
            setIsAiSchedulerModalOpen(false);
        }
    };
    
    const handleSaveAiSchedule = async () => {
        if (!targetWorkbook || aiSchedulerResults.length === 0) return;

        const newParticipations: Participation[] = aiSchedulerResults.map(res => {
            const findType = (title: string): ParticipationType => {
                if (title.toLowerCase().includes('tesouros') || title.toLowerCase().includes('joias') || title.toLowerCase().includes('leitura')) return ParticipationType.TESOUROS;
                if (title.toLowerCase().includes('ministério') || title.toLowerCase().includes('conversa') || title.toLowerCase().includes('interesse') || title.toLowerCase().includes('discípulos') || title.toLowerCase().includes('discurso')) return ParticipationType.MINISTERIO;
                if (title.toLowerCase().includes('vida cristã')) return ParticipationType.VIDA_CRISTA;
                if (title.toLowerCase().includes('dirigente')) return ParticipationType.DIRIGENTE;
                if (title.toLowerCase().includes('leitor')) return ParticipationType.LEITOR;
                if (title.toLowerCase().includes('presidente')) return ParticipationType.PRESIDENTE;
                if (title.toLowerCase().includes('oração inicial') || title.toLowerCase().includes('oração de abertura')) return ParticipationType.ORACAO_INICIAL;
                if (title.toLowerCase().includes('oração final') || title.toLowerCase().includes('oração de encerramento')) return ParticipationType.ORACAO_FINAL;
                return ParticipationType.MINISTERIO; // fallback
            };
            const week = targetWorkbook.name;
            return {
                id: generateUUID(),
                week: week,
                date: calculatePartDate(week),
                partTitle: res.partTitle,
                publisherName: res.publisherName,
                type: findType(res.partTitle),
            };
        });
        
        for (const p of newParticipations) {
            await saveParticipation(p);
        }
        
        setAiSchedulerResults([]);
        setTargetWorkbook(null);
        await loadData();
        setActiveTab('schedule');
    };

    const handleGenerateScheduleFromPdfUpload = async (file: File) => {
        setIsGeneratingSchedule(true);
        setIsScheduleUploadModalOpen(false);

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64String = (reader.result as string).split(',')[1];
                const weekName = file.name.replace(/\.pdf$/i, '').replace(/_/g, ' ');

                const tempWorkbook: Workbook = {
                    id: generateUUID(),
                    name: weekName,
                    fileData: base64String,
                    uploadDate: new Date().toISOString()
                };

                setTargetWorkbook(tempWorkbook);

                const results = await generateAiSchedule(tempWorkbook, publishers, participations, rules);
                setAiSchedulerResults(results);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                alert(message);
                setAiSchedulerResults([]);
            } finally {
                setIsGeneratingSchedule(false);
            }
        };
        reader.onerror = () => {
             alert("Ocorreu um erro ao ler o arquivo.");
             setIsGeneratingSchedule(false);
        };
        reader.readAsDataURL(file);
    };

    const handleExportData = async () => {
        const data = await getAllData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().split('T')[0];
        link.download = `designacoes_rvm_backup_${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileToImport(file);
            setIsImportConfirmOpen(true);
        }
    };

    const handleConfirmImport = () => {
        if (!fileToImport) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Falha ao ler o arquivo.");
                
                const data = JSON.parse(text);

                if (!data.publishers || !data.participations || !data.workbooks || !data.rules) {
                    throw new Error("O arquivo de backup parece estar em um formato inválido.");
                }

                await clearAllData();
                // FIX: Added a guard to prevent runtime errors by ensuring `db.rules` is defined before attempting to call `bulkAdd`. This makes the data import process more robust against different database schema versions.
                const importPromises = [
                    db.publishers.bulkAdd(data.publishers),
                    db.participations.bulkAdd(data.participations),
                    db.workbooks.bulkAdd(data.workbooks)
                ];
                if (db.rules) {
                    importPromises.push(db.rules.bulkAdd(data.rules));
                }
                await Promise.all(importPromises);

                alert("Dados importados com sucesso!");
                await loadData();

            } catch (error) {
                // FIX: Replaced if/else with a ternary for consistency and to ensure the 'unknown' error object is always converted to a string for display. This resolves a potential type inference issue.
                const message = error instanceof Error ? error.message : String(error);
                alert(`Erro ao importar dados: ${message}`);
            } finally {
                setIsImportConfirmOpen(false);
                setFileToImport(null);
                if (importInputRef.current) {
                    importInputRef.current.value = "";
                }
            }
        };
        reader.readAsText(fileToImport);
    };

    const groupedParticipations: Record<string, MeetingData> = useMemo(() => participations.reduce((acc, p) => {
        if (!acc[p.week]) {
            acc[p.week] = { week: p.week, parts: [] };
        }
        acc[p.week].parts.push(p);
        return acc;
    }, {} as Record<string, MeetingData>), [participations]);

    const uniqueWeeks = useMemo(() => {
        const weeks = Array.from(new Set(participations.map(p => p.week)));
        weeks.sort((a: string, b: string) => parseWeekDate(b).getTime() - parseWeekDate(a).getTime());
        return ['Todas', ...weeks];
    }, [participations]);

    const sortedPublisherNames = useMemo(() => ['Todos', ...publishers.map(p => p.name).sort((a, b) => a.localeCompare(b))], [publishers]);

    const filteredScheduleData = useMemo(() => {
        if (scheduleWeekFilter === 'Todas') return Object.values(groupedParticipations);
        return Object.values(groupedParticipations).filter(meeting => meeting.week === scheduleWeekFilter);
    }, [groupedParticipations, scheduleWeekFilter]);

    const filteredPublishers = useMemo(() => {
        return publishers.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(publisherSearchTerm.toLowerCase());
            const matchesCondition = publisherConditionFilter === 'Todas' || p.condition === publisherConditionFilter;
            const matchesAgeGroup = publisherAgeGroupFilter === 'Todos' || p.ageGroup === publisherAgeGroupFilter;
            const matchesServing = publisherServingFilter === 'Todos' || String(p.isServing) === publisherServingFilter;
            return matchesSearch && matchesCondition && matchesAgeGroup && matchesServing;
        });
    }, [publishers, publisherSearchTerm, publisherConditionFilter, publisherAgeGroupFilter, publisherServingFilter]);

    const filteredParticipations = useMemo(() => {
        const filtered = participations.filter(p => {
            const searchLower = participationSearchTerm.toLowerCase();
            const matchesSearch = p.publisherName.toLowerCase().includes(searchLower) || p.partTitle.toLowerCase().includes(searchLower);
            const matchesPublisher = participationPublisherFilter === 'Todos' || p.publisherName === participationPublisherFilter;
            return matchesSearch && matchesPublisher;
        });

        return filtered.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return participationSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [participations, participationSearchTerm, participationPublisherFilter, participationSortOrder]);
    
    const filteredWorkbooks = useMemo(() => workbooks.filter(w => w.name.toLowerCase().includes(workbookSearchTerm.toLowerCase())), [workbooks, workbookSearchTerm]);

    // FIX: Fixes a TypeScript type inference error by reordering the type guards.
    // By checking for the common 'name' property first, which exists on Publisher and Workbook,
    // we correctly handle those types. The `if` path for `partTitle` then correctly infers the type as Participation.
    const getItemToDeleteDisplayName = (item: Publisher | Participation | Workbook | null): string => {
        if (!item) return '';
        if ('name' in item) { // Handles Publisher and Workbook
            return item.name;
        }
        if ('partTitle' in item) { // Handles Participation
            return item.partTitle || item.week;
        }
        return '';
    };

    return (
        <div className="app-shell bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
            <header className="app-header bg-white dark:bg-gray-800 shadow-md sticky top-0 z-30">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Designações na RVM</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                             <button onClick={handleExportData} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none" title="Exportar Todos os Dados"><ArrowDownTrayIcon className="h-6 w-6" /></button>
                             <button onClick={() => importInputRef.current?.click()} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none" title="Importar Dados (Substitui os atuais)"><ArrowUpTrayIcon className="h-6 w-6" /></button>
                             <button onClick={() => setIsRuleManagerOpen(true)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none" title="Gerenciar Regras"><CogIcon className="h-6 w-6" /></button>
                            <input type="file" ref={importInputRef} onChange={handleImportFileSelect} accept="application/json" className="hidden"/>
                        </div>
                    </div>
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="app-tabs flex space-x-4 -mb-px">
                            { (['schedule', 'participations', 'publishers', 'workbooks', 'ai-assignments'] as Tab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`app-tab py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'is-active border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    {tabLabels[tab]}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {isLoading ? (
                    <p>Carregando dados...</p>
                ) : (
                    <>
                        {activeTab === 'publishers' && (
                            <div>
                                <div className="page-toolbar sticky top-[7.25rem] z-20 pt-4 bg-gray-100 dark:bg-gray-900">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold">Publicadores</h2>
                                        <button onClick={() => openPublisherForm(null)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Adicionar Publicador</button>
                                    </div>
                                    <div className="glass-panel mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-lg">
                                        <input type="text" placeholder="Buscar por nome..." value={publisherSearchTerm} onChange={e => setPublisherSearchTerm(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm text-gray-900 dark:text-gray-100"/>
                                        <select value={publisherConditionFilter} onChange={e => setPublisherConditionFilter(e.target.value)} className="pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm rounded-md">
                                            <option value="Todas">Todas as Condições</option>
                                            <option value="Ancião">Ancião</option>
                                            <option value="Servo Ministerial">Servo Ministerial</option>
                                            <option value="Publicador">Publicador</option>
                                        </select>
                                        <select value={publisherAgeGroupFilter} onChange={e => setPublisherAgeGroupFilter(e.target.value)} className="pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm rounded-md">
                                            <option value="Todos">Todas as Faixas Etárias</option>
                                            <option value="Adulto">Adulto</option>
                                            <option value="Jovem">Jovem</option>
                                            <option value="Criança">Criança</option>
                                        </select>
                                        <select value={publisherServingFilter} onChange={e => setPublisherServingFilter(e.target.value)} className="pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm rounded-md">
                                            <option value="Todos">Todos os Status</option>
                                            <option value="true">Atuante</option>
                                            <option value="false">Não Atuante</option>
                                        </select>
                                    </div>
                                </div>
                                <PublisherTable publishers={filteredPublishers} onEdit={openPublisherForm} onDelete={(p) => confirmDelete(p, 'publisher')} />
                            </div>
                        )}

                        {activeTab === 'participations' && (
                            <div>
                                <div className="page-toolbar sticky top-[7.25rem] z-20 pt-4 bg-gray-100 dark:bg-gray-900">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold">Participações</h2>
                                        <button onClick={() => openParticipationForm(null)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Adicionar Participação</button>
                                    </div>
                                    <div className="glass-panel mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-lg">
                                        <input type="text" placeholder="Buscar por nome ou parte..." value={participationSearchTerm} onChange={e => setParticipationSearchTerm(e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm text-gray-900 dark:text-gray-100"/>
                                        <select value={participationPublisherFilter} onChange={e => setParticipationPublisherFilter(e.target.value)} className="pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm rounded-md">
                                            {sortedPublisherNames.map(name => <option key={name} value={name}>{name}</option>)}
                                        </select>
                                        <select value={participationSortOrder} onChange={e => setParticipationSortOrder(e.target.value as 'desc' | 'asc')} className="pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm rounded-md">
                                            <option value="desc">Mais Recentes</option>
                                            <option value="asc">Mais Antigas</option>
                                        </select>
                                    </div>
                                </div>
                                <ParticipationTable participations={filteredParticipations} onEdit={openParticipationForm} onDelete={(p) => confirmDelete(p, 'participation')} />
                            </div>
                        )}
                        
                        {activeTab === 'schedule' && (
                            <div>
                                <div className="page-toolbar sticky top-[7.25rem] z-20 flex flex-col sm:flex-row justify-between items-center py-4 gap-4 bg-gray-100 dark:bg-gray-900">
                                    <h2 className="text-2xl font-bold">Pauta das Reuniões</h2>
                                     <div className="flex items-center gap-4">
                                        <select value={scheduleWeekFilter} onChange={e => setScheduleWeekFilter(e.target.value)} className="w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm rounded-md">
                                            {uniqueWeeks.map(week => <option key={week} value={week}>{week === 'Todas' ? 'Todas as Semanas' : week}</option>)}
                                        </select>
                                        <button onClick={() => setIsScheduleUploadModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 whitespace-nowrap">Adicionar Pauta de PDF</button>
                                    </div>
                                </div>
                                <MeetingSchedule scheduleData={filteredScheduleData} publishers={publishers} onEditWeek={handleEditWeek} onOpenPrintableView={handleOpenPrintableSchedule}/>
                            </div>
                        )}

                        {activeTab === 'workbooks' && (
                            <div>
                                <div className="page-toolbar sticky top-[7.25rem] z-20 pt-4 bg-gray-100 dark:bg-gray-900">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold">Apostilas</h2>
                                        <button onClick={() => openWorkbookModal(null)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Upload de Apostila</button>
                                    </div>
                                    <div className="glass-panel mb-4 p-4">
                                        <input type="text" placeholder="Buscar por nome da apostila..." value={workbookSearchTerm} onChange={e => setWorkbookSearchTerm(e.target.value)} className="w-full max-w-xs px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm text-gray-900 dark:text-gray-100"/>
                                    </div>
                                </div>
                                <WorkbookList workbooks={filteredWorkbooks} onEdit={openWorkbookModal} onDelete={(w) => confirmDelete(w, 'workbook')} />
                            </div>
                        )}
                        
                        {activeTab === 'ai-assignments' && (
                            <div>
                                <div className="ai-highlight-card text-center p-8">
                                    <h2 className="text-2xl font-bold mb-2 text-white">Designações por IA</h2>
                                    <p className="text-white/80 mb-6">Deixe a IA gerar uma sugestão de pauta para uma semana futura com base no histórico e nas regras.</p>
                                    <button onClick={() => setIsAiSchedulerModalOpen(true)} className="px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Gerar Pauta com IA</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <PublisherForm 
                isOpen={isPublisherFormOpen}
                onClose={() => setIsPublisherFormOpen(false)}
                onSave={handleSavePublisher}
                publisherToEdit={publisherToEdit}
                publishers={publishers}
            />
            
            <ParticipationForm
                isOpen={isParticipationFormOpen}
                onClose={() => setIsParticipationFormOpen(false)}
                onSave={handleSaveParticipations}
                participationToEdit={participationToEdit}
                publishers={publishers}
                rules={rules}
            />

             <MeetingScheduleForm
                isOpen={isMeetingScheduleFormOpen}
                onClose={() => setIsMeetingScheduleFormOpen(false)}
                onSave={handleSaveWeekSchedule}
                scheduleToEdit={meetingScheduleToEdit}
                publishers={publishers}
            />

            <WorkbookUploadModal
                isOpen={isWorkbookModalOpen}
                onClose={() => setIsWorkbookModalOpen(false)}
                onSave={handleSaveWorkbook}
                workbookToEdit={workbookToEdit}
            />
            
            <RuleManagerModal
                isOpen={isRuleManagerOpen}
                onClose={() => setIsRuleManagerOpen(false)}
                rules={rules}
                onSave={handleSaveRule}
                onDelete={handleDeleteRule}
            />

            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={onDeleteConfirm}
                title={`Confirmar Exclusão`}
                message={`Tem certeza que deseja excluir "${getItemToDeleteDisplayName(itemToDelete)}"? Esta ação não pode ser desfeita.`}
            />

            <ConfirmationModal
                isOpen={isImportConfirmOpen}
                onClose={() => setIsImportConfirmOpen(false)}
                onConfirm={handleConfirmImport}
                title="Confirmar Importação de Dados"
                message="Atenção: Isso substituirá TODOS os dados atuais (publicadores, participações, etc.) pelos dados do arquivo selecionado. Esta ação não pode ser desfeita. Deseja continuar?"
            />

            <AiSchedulerModal
                isOpen={isAiSchedulerModalOpen}
                onClose={() => setIsAiSchedulerModalOpen(false)}
                onGenerate={handleGenerateAiSchedule}
                workbooks={workbooks}
                isGenerating={isGeneratingSchedule}
            />

            <AiScheduleResultsModal
                isOpen={aiSchedulerResults.length > 0 && !isGeneratingSchedule}
                onClose={() => setAiSchedulerResults([])}
                onSave={handleSaveAiSchedule}
                results={aiSchedulerResults}
                workbookName={targetWorkbook?.name || ''}
            />

            <ScheduleUploadModal
                isOpen={isScheduleUploadModalOpen}
                onClose={() => setIsScheduleUploadModalOpen(false)}
                onUpload={handleGenerateScheduleFromPdfUpload}
                isGenerating={isGeneratingSchedule}
            />

        </div>
    );
};

export default App;