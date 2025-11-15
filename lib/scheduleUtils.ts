import { Participation, ParticipationType, Publisher } from '../types';

export type RenderablePart = Participation & { pair?: Participation };

export const ministrySubOrder = ["Iniciando conversas", "Cultivando o interesse", "Fazendo discípulos", "Explicando suas crenças", "Discurso"];

export function getOrderedAndPairedParts(parts: Participation[], publishers: Publisher[]): RenderablePart[] {
    const paired: RenderablePart[] = [];
    const usedPairIds = new Set<string>();

    // 1. Lógica de pareamento: Encontra ajudantes e leitores associados
    for (const currentPart of parts) {
        // Ignora partes que já foram pareadas ou são do tipo 'par'
        if (usedPairIds.has(currentPart.id) || currentPart.type === ParticipationType.AJUDANTE || currentPart.type === ParticipationType.LEITOR) {
            continue;
        }
        
        // Pareia estudantes com ajudantes com lógica de segurança
        if (currentPart.type === ParticipationType.MINISTERIO && !currentPart.partTitle.toLowerCase().includes('discurso')) {
            const studentPublisher = publishers.find(p => p.name === currentPart.publisherName);
            let helper: Participation | undefined;
            const availableHelpers = parts.filter(p => p.type === ParticipationType.AJUDANTE && !usedPairIds.has(p.id));

            if (studentPublisher?.ageGroup === 'Criança') {
                // Se o estudante for uma criança, a lógica de pareamento é mais rigorosa.
                // Prioridade 1: Encontrar um pai/mãe como ajudante.
                helper = availableHelpers.find(h => {
                    const helperPublisher = publishers.find(p => p.name === h.publisherName);
                    return helperPublisher && studentPublisher.parentIds.includes(helperPublisher.id);
                });
                
                // Prioridade 2: Se não houver pai/mãe disponível e houver autorização, encontrar um ajudante adulto.
                if (!helper && studentPublisher.canPairWithNonParent) {
                    helper = availableHelpers.find(h => {
                        const helperPublisher = publishers.find(p => p.name === h.publisherName);
                        return helperPublisher?.ageGroup === 'Adulto';
                    });
                }
            } else {
                // Para adultos ou jovens, encontra qualquer ajudante disponível.
                helper = availableHelpers[0];
            }

            if (helper) {
                paired.push({ ...currentPart, pair: helper });
                usedPairIds.add(helper.id);
            } else {
                paired.push(currentPart);
            }
        // Pareia dirigente com leitor
        } else if (currentPart.type === ParticipationType.DIRIGENTE) {
            const reader = parts.find(p => p.type === ParticipationType.LEITOR && !usedPairIds.has(p.id));
            if (reader) {
                paired.push({ ...currentPart, pair: reader });
                usedPairIds.add(reader.id);
            } else {
                paired.push(currentPart);
            }
        } else {
             paired.push(currentPart);
        }
    }

    // 2. Lógica de Ordenação: Aplica as regras da pauta oficial
    const sortedPaired = paired.sort((a, b) => {
        const sectionOrder: Record<string, number> = {
            [ParticipationType.TESOUROS]: 1,
            [ParticipationType.MINISTERIO]: 2,
            [ParticipationType.VIDA_CRISTA]: 3,
            [ParticipationType.DIRIGENTE]: 3, // Parte da seção Vida Cristã
        };

        const sectionA = sectionOrder[a.type] || 99; // Partes como Presidente/Oração vão para o final
        const sectionB = sectionOrder[b.type] || 99;

        if (sectionA !== sectionB) {
            return sectionA - sectionB;
        }

        // Regras de ordenação dentro de cada seção
        switch (a.type) {
            case ParticipationType.TESOUROS:
                const aIsReading = a.partTitle.toLowerCase().includes('leitura da bíblia');
                const bIsReading = b.partTitle.toLowerCase().includes('leitura da bíblia');
                if (aIsReading !== bIsReading) return aIsReading ? 1 : -1; // Leitura sempre por último
                break;

            case ParticipationType.MINISTERIO:
                const aIndex = ministrySubOrder.findIndex(sub => a.partTitle.toLowerCase().includes(sub.toLowerCase()));
                const bIndex = ministrySubOrder.findIndex(sub => b.partTitle.toLowerCase().includes(sub.toLowerCase()));
                if (aIndex !== bIndex) return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
                break;

            case ParticipationType.VIDA_CRISTA:
            case ParticipationType.DIRIGENTE:
                const aIsStudy = a.type === ParticipationType.DIRIGENTE;
                const bIsStudy = b.type === ParticipationType.DIRIGENTE;
                if (aIsStudy !== bIsStudy) return aIsStudy ? 1 : -1; // Estudo Bíblico sempre por último
                break;
        }
        
        // Fallback para ordenação alfabética
        return a.partTitle.localeCompare(b.partTitle, 'pt-BR');
    });
    
    // Retorna apenas as partes principais (sem Presidente/Oração), pois a UI os trata separadamente
    return sortedPaired.filter(p => [ParticipationType.TESOUROS, ParticipationType.MINISTERIO, ParticipationType.VIDA_CRISTA, ParticipationType.DIRIGENTE].includes(p.type));
}