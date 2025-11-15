import React, { useState, useEffect, useMemo } from 'react';
import { Participation, ParticipationType, Publisher, Rule, ParticipationFormProps } from '../types';
import { generateUUID, calculatePartDate, PAIRABLE_PART_TYPES, validatePairing } from '../lib/utils';
import { validateAssignment } from '../lib/inferenceEngine';
import { SparklesIcon } from './icons';

const ParticipationForm: React.FC<ParticipationFormProps> = ({ isOpen, onClose, onSave, participationToEdit, publishers, rules }) => {
  const [week, setWeek] = useState('');
  const [partTitle, setPartTitle] = useState('');
  const [partType, setPartType] = useState<ParticipationType>(ParticipationType.MINISTERIO);
  
  // State for single participant or student
  const [studentName, setStudentName] = useState('');
  // State for helper
  const [helperName, setHelperName] = useState('');
  
  const isPairedPart = useMemo(() => PAIRABLE_PART_TYPES.includes(partType), [partType]);

  useEffect(() => {
    if (isOpen) {
      if (participationToEdit) {
        setWeek(participationToEdit.week);
        setPartTitle(participationToEdit.partTitle);
        setPartType(participationToEdit.type);
        setStudentName(participationToEdit.publisherName);
        setHelperName('');
      } else {
        setWeek('');
        setPartTitle('');
        setPartType(ParticipationType.MINISTERIO);
        setStudentName('');
        setHelperName('');
      }
    }
  }, [participationToEdit, isOpen]);
  
  // Memoized list of eligible students/participants based on the selected part type and week
  const eligibleStudents = useMemo(() => {
    if (!partType || !week) return [];
    const meetingDate = calculatePartDate(week).split('T')[0];
    return publishers.filter(p => {
      const validation = validateAssignment({ publisher: p, partType, partTitle: partTitle || partType, meetingDate }, rules);
      return validation.isValid;
    });
  }, [partType, partTitle, week, publishers, rules]);

  // Memoized list of eligible helpers based on the selected student
  const eligibleHelpers = useMemo(() => {
    if (!isPairedPart || !studentName) return [];
    const student = publishers.find(p => p.name === studentName);
    if (!student) return [];
    const meetingDate = calculatePartDate(week).split('T')[0];

    return publishers.filter(p => {
      if (p.id === student.id) return false; // Cannot be their own helper
      
      const pairingValidation = validatePairing(student, p);
      if (!pairingValidation.isValid) return false;
      
      const helperAssignmentValidation = validateAssignment({ publisher: p, partType: ParticipationType.AJUDANTE, partTitle: 'Ajudante', meetingDate }, rules);
      return helperAssignmentValidation.isValid;
    });
  }, [isPairedPart, studentName, week, publishers, rules]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName || !week || !partTitle) {
      alert("Os campos de Estudante/Participante, Semana e Título da Parte são obrigatórios.");
      return;
    }

    const studentPublisher = publishers.find(p => p.name === studentName);
    if (!studentPublisher) {
      alert("Estudante/Participante não encontrado.");
      return;
    }
    
    const meetingDate = calculatePartDate(week).split('T')[0];
    
    // --- Validation for Student/Main Participant ---
    let studentValidation = validateAssignment({ publisher: studentPublisher, partType, partTitle, meetingDate }, rules);
    if (!studentValidation.isValid) {
        alert(`Designação inválida para ${studentName}: ${studentValidation.reason}`);
        return;
    }

    const participationsToSave: Participation[] = [];
    
    // --- Validation for Helper (if applicable) ---
    if (isPairedPart) {
        if (!helperName) {
            alert("Ajudante é obrigatório para este tipo de parte.");
            return;
        }
        const helperPublisher = publishers.find(p => p.name === helperName);
        if (!helperPublisher) {
            alert("Ajudante não encontrado.");
            return;
        }

        // Validate pairing rules (e.g., child with parent)
        const pairingValidation = validatePairing(studentPublisher, helperPublisher);
        if (!pairingValidation.isValid) {
            alert(`Erro de pareamento: ${pairingValidation.reason}`);
            return;
        }

        // Validate helper's own assignment rules
        let helperValidation = validateAssignment({ publisher: helperPublisher, partType: ParticipationType.AJUDANTE, partTitle: 'Ajudante', meetingDate }, rules);
        if (!helperValidation.isValid) {
            alert(`Designação inválida para o ajudante ${helperName}: ${helperValidation.reason}`);
            return;
        }
        
        // Add helper participation to the save list
        participationsToSave.push({
            id: generateUUID(),
            publisherName: helperName,
            week,
            partTitle: 'Ajudante',
            type: ParticipationType.AJUDANTE,
            date: calculatePartDate(week),
        });
    }
    
    // Add student participation to the save list
    participationsToSave.push({
        id: participationToEdit ? participationToEdit.id : generateUUID(),
        publisherName: studentName,
        week,
        partTitle,
        type: partType,
        date: calculatePartDate(week),
    });

    onSave(participationsToSave);
    onClose();
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 flex flex-col" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {participationToEdit ? 'Editar Participação' : 'Adicionar Designação'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          <div className="p-6 flex-grow overflow-y-auto space-y-4">
            
            <div>
              <label htmlFor="week" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semana (ex: 1-7 de JAN, 2025)</label>
              <input type="text" name="week" id="week" value={week} onChange={(e) => setWeek(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm text-black"/>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
              <select name="type" id="type" value={partType} onChange={(e) => setPartType(e.target.value as ParticipationType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white text-black focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm rounded-md">
                {Object.values(ParticipationType).filter(t => t !== ParticipationType.AJUDANTE).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="partTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título da Parte</label>
              <input type="text" name="partTitle" id="partTitle" value={partTitle} onChange={(e) => setPartTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm text-black"/>
            </div>
            
            <div className={`grid grid-cols-1 ${isPairedPart ? 'md:grid-cols-2 gap-4' : ''}`}>
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{isPairedPart ? 'Estudante' : 'Participante'}</label>
                <select name="studentName" id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm text-black">
                  <option value="" disabled>
                    {eligibleStudents.length === 0 && partType && week 
                      ? "Nenhum publicador qualificado disponível" 
                      : "Selecione um participante..."}
                  </option>
                  {eligibleStudents.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                {eligibleStudents.length === 0 && partType && week && (
                  <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                    ⚠️ Nenhum publicador atende aos critérios para esta parte na data selecionada.
                  </p>
                )}
              </div>
              
              {isPairedPart && (
                <div>
                  <label htmlFor="helperName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ajudante</label>
                  <select name="helperName" id="helperName" value={helperName} onChange={(e) => setHelperName(e.target.value)} required disabled={!studentName} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm text-black disabled:bg-gray-200 disabled:opacity-50">
                    <option value="" disabled>
                      {!studentName ? "Selecione primeiro o estudante" 
                       : eligibleHelpers.length === 0 ? "Nenhum ajudante qualificado"
                       : "Selecione um ajudante..."}
                    </option>
                    {eligibleHelpers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                  {studentName && eligibleHelpers.length === 0 && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      🚫 Nenhum ajudante qualificado para este estudante. Verifique regras de pareamento.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParticipationForm;