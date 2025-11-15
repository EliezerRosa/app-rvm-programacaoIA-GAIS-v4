import { MeetingData, ParticipationType, Publisher } from '../types';
import { RenderablePart, getOrderedAndPairedParts } from './scheduleUtils';

const renderPartToHtml = (part: RenderablePart, partNumber: number): string => {
    let title = part.partTitle;
    let name = part.publisherName;
    const durationText = part.duration ? `(${part.duration} min)` : '';
    
    if (part.type === ParticipationType.DIRIGENTE) {
        title = "Estudo Bíblico de Congregação";
    }

    if (part.pair) {
        if (part.type === ParticipationType.DIRIGENTE) {
            name = `${part.publisherName} (Dirigente) / ${part.pair.publisherName} (Leitor)`;
        } else { 
            name = `${part.publisherName} / ${part.pair.publisherName}`;
        }
    }

    return `
        <tr>
            <td style="padding: 8px 4px; border-bottom: 1px solid #e2e8f0; text-align: left;">${partNumber}. ${title}</td>
            <td style="padding: 8px 4px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #4a5568;">
                <span style="margin-right: 16px;">${name}</span>
                <span style="color: #a0aec0; width: 50px; display: inline-block; text-align: right;">${durationText}</span>
            </td>
        </tr>
    `;
}

export const getScheduleHtml = (meetingData: MeetingData, congregationName: string, publishers: Publisher[]): string => {
    // FIX: Pass the `publishers` array to `getOrderedAndPairedParts` as it is a required argument for pairing logic.
    const mainParts = getOrderedAndPairedParts(meetingData.parts, publishers);
    const president = meetingData.parts.find(p => p.type === ParticipationType.PRESIDENTE);
    const openingPrayer = meetingData.parts.find(p => p.type === ParticipationType.ORACAO_INICIAL);
    const closingPrayer = meetingData.parts.find(p => p.type === ParticipationType.ORACAO_FINAL);
    
    const treasuresParts = mainParts.filter(p => p.type === ParticipationType.TESOUROS);
    const ministryParts = mainParts.filter(p => p.type === ParticipationType.MINISTERIO);
    const lifeParts = mainParts.filter(p => p.type === ParticipationType.VIDA_CRISTA || p.type === ParticipationType.DIRIGENTE);
    
    let partCounter = 1;

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pauta da Reunião - ${meetingData.week}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    line-height: 1.6;
                    color: #2d3748;
                    margin: 0;
                    padding: 20px;
                    background-color: #f7fafc;
                }
                .container {
                    max-width: 800px;
                    margin: auto;
                    background: #fff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                h1, h2, h3 { margin-top: 0; }
                h1 {
                    font-size: 1.8em;
                    text-align: center;
                    color: #4a5568;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }
                h2 {
                    font-size: 1.4em;
                    text-align: center;
                    color: #2d3748;
                    margin-bottom: 20px;
                }
                h3 {
                    font-size: 1.15em;
                    font-weight: 700;
                    color: #fff;
                    padding: 8px 12px;
                    border-radius: 4px;
                    margin-top: 25px;
                    margin-bottom: 15px;
                }
                .treasures h3 { background-color: #4A5568; } /* Dark Gray */
                .ministry h3 { background-color: #D69E2E; } /* Yellow-Orange */
                .life h3 { background-color: #C53030; } /* Red */
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .header-info {
                    margin-bottom: 20px;
                    padding: 15px;
                    background-color: #edf2f7;
                    border-radius: 6px;
                    text-align: center;
                }
                .president-info {
                    font-size: 1.1em;
                    color: #4a5568;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 0.9em;
                    color: #718096;
                }
                 @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <button class="no-print" onclick="window.print()" style="position: absolute; top: 10px; right: 10px; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; background-color: #f0f0f0; cursor: pointer;">Imprimir</button>

                <h1>${congregationName}</h1>
                <h2>Programação da reunião do meio de semana</h2>
                
                <div class="header-info">
                    <strong>${meetingData.week}</strong><br>
                    ${president ? `<span class="president-info">Presidente: ${president.publisherName}</span>` : ''}
                </div>

                <table><tbody>
                    ${openingPrayer ? `<tr><td style="padding: 8px 4px; font-weight: bold;">Oração Inicial:</td><td style="padding: 8px 4px; text-align: right;">${openingPrayer.publisherName}</td></tr>` : ''}
                </tbody></table>
                
                <div class="treasures">
                    <h3>TESOUROS DA PALAVRA DE DEUS</h3>
                    <table><tbody>
                        ${treasuresParts.map(p => renderPartToHtml(p, partCounter++)).join('')}
                    </tbody></table>
                </div>
                
                <div class="ministry">
                    <h3>FAÇA SEU MELHOR NO MINISTÉRIO</h3>
                    <table><tbody>
                        ${ministryParts.map(p => renderPartToHtml(p, partCounter++)).join('')}
                    </tbody></table>
                </div>
                
                <div class="life">
                    <h3>NOSSA VIDA CRISTÃ</h3>
                    <table><tbody>
                        ${lifeParts.map(p => renderPartToHtml(p, partCounter++)).join('')}
                    </tbody></table>
                </div>

                <table><tbody>
                    ${closingPrayer ? `<tr><td style="padding: 8px 4px; font-weight: bold; border-top: 1px solid #e2e8f0; margin-top: 10px;">Oração Final:</td><td style="padding: 8px 4px; text-align: right; border-top: 1px solid #e2e8f0; margin-top: 10px;">${closingPrayer.publisherName}</td></tr>` : ''}
                </tbody></table>
                
                <div class="footer">
                    <p>S-140-T 11/23</p>
                </div>
            </div>
        </body>
        </html>
    `;
};