import { GoogleGenAI, Type } from "@google/genai";
import { Publisher, Participation, Rule, Workbook, ParticipationType } from '../types';
import { validateAssignment } from './inferenceEngine';
import { parseScheduleFromPdf } from './pdfParser';
import { calculatePartDate } from './utils';

let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("A chave da API do Google GenAI não está configurada.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

/**
 * Tenta extrair as partes da reunião analisando o PDF da apostila.
 * Se a análise falhar, retorna uma lista de partes padrão como fallback.
 * @param workbook O objeto da apostila contendo os dados do arquivo em base64.
 * @returns Uma promessa que resolve para um array de partes da reunião.
 */
const getPartsFromWorkbook = async (workbook: Workbook): Promise<{ partTitle: string; type: ParticipationType; duration?: number }[]> => {
    const mockParts = [
        { partTitle: 'Discurso de Abertura (Tema da Semana)', type: ParticipationType.TESOUROS, duration: 10 },
        { partTitle: 'Joias Espirituais', type: ParticipationType.TESOUROS, duration: 10 },
        { partTitle: 'Leitura da Bíblia', type: ParticipationType.TESOUROS, duration: 4 },
        { partTitle: 'Iniciando Conversas', type: ParticipationType.MINISTERIO, duration: 3 },
        { partTitle: 'Cultivando o Interesse', type: ParticipationType.MINISTERIO, duration: 4 },
        { partTitle: 'Discurso', type: ParticipationType.MINISTERIO, duration: 5 },
        { partTitle: 'Nossa Vida Cristã (Tema da Semana)', type: ParticipationType.VIDA_CRISTA, duration: 15 },
        { partTitle: 'Dirigente do EBC', type: ParticipationType.DIRIGENTE, duration: 30 },
        { partTitle: 'Leitor do EBC', type: ParticipationType.LEITOR },
        { partTitle: 'Presidente', type: ParticipationType.PRESIDENTE },
        { partTitle: 'Oração Inicial', type: ParticipationType.ORACAO_INICIAL },
        { partTitle: 'Oração Final', type: ParticipationType.ORACAO_FINAL },
    ];

    try {
        const parsedParts = await parseScheduleFromPdf(workbook.fileData);
        if (parsedParts.length < 3) {
            console.warn(`A análise do PDF para "${workbook.name}" retornou poucas partes. Usando dados simulados.`);
            return mockParts;
        }
        console.log(`Análise do PDF "${workbook.name}" bem-sucedida. Partes extraídas:`, parsedParts.length);
        return parsedParts;
    } catch (error) {
        console.error(`Falha ao analisar o PDF para "${workbook.name}". Usando dados simulados.`, error);
        return mockParts;
    }
};


const responseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            partTitle: { type: Type.STRING },
            publisherName: { type: Type.STRING },
        },
        required: ["partTitle", "publisherName"],
    }
};

export async function generateAiSchedule(
    workbook: Workbook,
    publishers: Publisher[],
    history: Participation[],
    rules: Rule[]
): Promise<{ partTitle: string; publisherName: string; reason: string; }[]> {
    try {
        const ai = getAiInstance();
        const partsToFill = await getPartsFromWorkbook(workbook);
        const meetingDate = calculatePartDate(workbook.name).split('T')[0]; // Get YYYY-MM-DD

        const availablePublishers = publishers.filter(p => {
            if (!p.isServing) return false;
            if (p.availability.mode === 'always') return !p.availability.exceptionDates.includes(meetingDate);
            if (p.availability.mode === 'never') return p.availability.exceptionDates.includes(meetingDate);
            return false;
        });

        const publishersWithHistory = availablePublishers.map(p => {
            const lastAssignment = history
                .filter(h => h.publisherName === p.name)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            
            return {
                id: p.id,
                name: p.name,
                condition: p.condition,
                gender: p.gender,
                ageGroup: p.ageGroup,
                parentIds: p.parentIds,
                isHelperOnly: p.isHelperOnly,
                canPairWithNonParent: p.canPairWithNonParent,
                lastAssignmentDate: lastAssignment ? lastAssignment.week : 'nunca',
                privileges: p.privileges,
                privilegesBySection: p.privilegesBySection,
            };
        });

        const activeRulesText = rules.filter(r => r.isActive).map(r => `- ${r.description}`).join('\n');

        const prompt = `
            Você é um assistente especialista em criar pautas para reuniões de Testemunhas de Jeová. Sua tarefa é preencher a pauta para a semana de "${workbook.name}", que ocorrerá na data ${meetingDate}.

            **1. Pauta a Ser Preenchida:**
            ${partsToFill.map(p => `- Título: "${p.partTitle}", Tipo/Seção: ${p.type}`).join('\n')}

            **2. Publicadores Disponíveis para Esta Data:**
            ${publishersWithHistory.map(p => `- Nome: ${p.name}, ID: ${p.id}, Condição: ${p.condition}, Gênero: ${p.gender}, Faixa Etária: ${p.ageGroup}, IDs dos Pais: [${p.parentIds.join(', ')}], Só Ajudante: ${p.isHelperOnly}, Última Designação: ${p.lastAssignmentDate}`).join('\n')}

            **3. Instruções Críticas de Designação (Siga estritamente):**
            - **REGRA MAIS IMPORTANTE: Prioridade por Histórico:** Dê preferência a quem está há mais tempo sem designação (campo "Última Designação"). Tente equilibrar as designações.
            - **Disponibilidade e Status:** A lista de publicadores acima JÁ FOI FILTRADA por disponibilidade e status de atuante. Use apenas os nomes listados.
            - **Regra para Novatos ('Só Ajudante'):** Se um publicador está marcado como 'Só Ajudante' (isHelperOnly = true), ele SÓ pode ser designado como 'Ajudante' para outra pessoa. Ele NUNCA deve receber uma parte principal (como estudante, leitor, ou discursista).
            - **Regra de Pareamento de Crianças:** Se um estudante tem a faixa etária 'Criança', seu ajudante DEVE ser um de seus pais (o ID do ajudante deve corresponder a um dos IDs no campo 'parentIds' do estudante). A única exceção é se o campo 'canPairWithNonParent' for verdadeiro; nesse caso, o ajudante pode ser outro publicador, mas DEVE ser um 'Adulto'.
            - **Filtro Hierárquico:** Um publicador só pode ser designado se: 1) Tiver permissão para a SEÇÃO da reunião (Tesouros, Ministério, Vida Cristã) E 2) Tiver os privilégios ESPECÍFICOS para a parte (ex: presidir, discursar).
            - **Rodízio de Anciãos/SMs:** Dê prioridade MÁXIMA a publicadores (irmãos e irmãs não designados) para as partes na seção "Faça Seu Melhor no Ministério". Só designe um Ancião ou Servo Ministerial nesta seção se não houver mais ninguém qualificado e disponível.
            - **Restrição para Irmãs:** Irmãs NUNCA devem ser designadas para partes cujo título contenha a palavra "Discurso". Qualquer parte na seção "Faça Seu Melhor no Ministério" que não seja uma demonstração (Iniciando Conversas, Cultivando Interesse, etc.) deve ser considerada um "Discurso".
            - **Restrição para Irmãos Publicadores:** Irmãos que não são Anciãos nem Servos Ministeriais, quando participam na seção "Tesouros da Palavra de Deus", SÓ podem ser designados para a "Leitura da Bíblia".
            - **Regras Adicionais:**
              ${activeRulesText}
            - **Variação de Pares:** Evite repetir os mesmos pares de estudante/ajudante das últimas semanas.

            **4. Formato da Resposta:**
            Sua resposta DEVE ser um array de objetos JSON, onde cada objeto contém "partTitle" e "publisherName". Preencha TODAS as partes.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const suggestedAssignments = JSON.parse(response.text.trim());

        const validatedAssignments: { partTitle: string; publisherName: string; reason: string; }[] = [];
        for (const assignment of suggestedAssignments) {
            const publisher = publishers.find(p => p.name === assignment.publisherName);
            const part = partsToFill.find(p => p.partTitle === assignment.partTitle);

            if (publisher && part) {
                const validation = validateAssignment({ publisher, partType: part.type, partTitle: part.partTitle, meetingDate }, rules);
                if (validation.isValid) {
                     const publisherInfo = publishersWithHistory.find(p => p.name === publisher.name);
                     const reason = publisherInfo?.lastAssignmentDate === 'nunca' 
                        ? "Primeira designação." 
                        : `Última parte em ${publisherInfo?.lastAssignmentDate}.`;
                    validatedAssignments.push({ ...assignment, reason });
                } else {
                    console.warn(`IA sugeriu uma designação inválida que foi bloqueada: ${assignment.publisherName} para ${assignment.partTitle}. Motivo: ${validation.reason}`);
                }
            }
        }

        return validatedAssignments;

    } catch (error) {
        console.error("Erro ao gerar pauta com IA:", error);
        throw new Error("Não foi possível gerar a pauta. Verifique a configuração da API e tente novamente.");
    }
}