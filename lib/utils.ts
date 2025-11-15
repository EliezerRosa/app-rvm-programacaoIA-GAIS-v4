import { ParticipationType, Publisher, ValidationResponse } from '../types';

// A simple UUID v4 generator. In a production app, a more robust library like `uuid` might be preferable.
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Function to correctly parse Portuguese week strings into Date objects for sorting
export const parseWeekDate = (weekString: string): Date => {
    const monthMap: Record<string, number> = {
        'JAN': 0, 'FEV': 1, 'MAR': 2, 'ABR': 3, 'MAI': 4, 'JUN': 5,
        'JUL': 6, 'AGO': 7, 'SET': 8, 'OUT': 9, 'NOV': 10, 'DEZ': 11
    };
    
    // "30 de DEZ, 2024 - 5 de JAN, 2025" or "3-9 de NOV, 2025"
    const cleaned = weekString.replace(/,/g, '').toUpperCase();
    const parts = cleaned.split(' ');

    const day = parseInt(parts[0].split('-')[0], 10);
    if (isNaN(day)) return new Date(0);

    let month: number | undefined;
    let year: number | undefined;
    
    // Find the first month and its index
    const firstMonthIndex = parts.findIndex(p => monthMap[p] !== undefined);
    
    if (firstMonthIndex === -1) return new Date(0); // No month found
    
    month = monthMap[parts[firstMonthIndex]];
    
    // Check if the token immediately after the month is a year
    if (firstMonthIndex + 1 < parts.length) {
        const potentialYear = parseInt(parts[firstMonthIndex + 1], 10);
        if (!isNaN(potentialYear) && potentialYear > 2000) {
            year = potentialYear;
        }
    }
    
    // If year wasn't found after the month, assume it's the last token of the string
    if (year === undefined) {
        const lastPart = parts[parts.length - 1];
        const potentialYear = parseInt(lastPart, 10);
        if (!isNaN(potentialYear) && potentialYear > 2000) {
            year = potentialYear;
        }
    }

    if (month !== undefined && year !== undefined) {
        // Use UTC to prevent timezone-related date shifts
        return new Date(Date.UTC(year, month, day));
    }

    return new Date(0); // Fallback
};

/**
 * Calculates the specific meeting date (Wednesday or Thursday) based on the week string.
 * @param weekString The string representing the meeting week.
 * @returns An ISO date string for the calculated meeting day.
 */
export const calculatePartDate = (weekString: string): string => {
    const startDate = parseWeekDate(weekString);

    // parseWeekDate returns a date at UTC epoch (time 0) on failure
    if (startDate.getTime() === 0) { 
        return new Date(0).toISOString();
    }
    
    const year = startDate.getUTCFullYear();
    
    // The meeting is during the week that starts on Monday.
    // Wednesday is 3, Thursday is 4 (Sunday=0, Monday=1, ...)
    const targetDayOfWeek = year % 2 !== 0 ? 3 : 4; // Odd year -> Wednesday, Even year -> Thursday

    // Assuming the week always starts on Monday (day 1), we find the difference.
    const dayDifference = targetDayOfWeek - 1; // e.g., for Wednesday (3), diff is 2 from Monday (1)

    const meetingDate = new Date(startDate.getTime()); // Create a copy to avoid mutation
    meetingDate.setUTCDate(startDate.getUTCDate() + dayDifference);

    return meetingDate.toISOString();
};


/**
 * Opens a new browser tab and writes the provided HTML content to it.
 * @param htmlContent The full HTML string to be displayed.
 */
export const openHtmlInNewTab = (htmlContent: string): void => {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
    } else {
        alert("Não foi possível abrir a nova aba. Por favor, verifique se o seu navegador está bloqueando pop-ups.");
    }
};

// NOVO: Define os tipos de parte que exigem um par (estudante/ajudante).
export const PAIRABLE_PART_TYPES = [
    ParticipationType.MINISTERIO,
];

// NOVO: Valida as regras de segurança para pareamento, especialmente para crianças.
export const validatePairing = (student: Publisher, helper: Publisher): ValidationResponse => {
    if (student.ageGroup === 'Criança') {
        const isParent = student.parentIds.includes(helper.id);
        const isAdult = helper.ageGroup === 'Adulto';

        if (isParent) {
            return { isValid: true, reason: '' }; // Pareamento com pai/mãe é sempre válido.
        }

        if (student.canPairWithNonParent && isAdult) {
            return { isValid: true, reason: '' }; // Pareamento com adulto autorizado é válido.
        }

        if (!student.canPairWithNonParent) {
            return { isValid: false, reason: `Crianças só podem ter um dos pais como ajudante. Autorização para terceiros não concedida.` };
        }

        if (!isAdult) {
            return { isValid: false, reason: `O ajudante de uma criança deve ser um adulto.` };
        }
    }
    return { isValid: true, reason: '' }; // Para adultos e jovens, qualquer pareamento é válido.
};