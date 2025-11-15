document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('generateForm');
    const resultSection = document.getElementById('resultSection');
    const scheduleResult = document.getElementById('scheduleResult');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const date = document.getElementById('date').value;
        const participants = document.getElementById('participants').value;

        // Show loading state
        resultSection.style.display = 'block';
        scheduleResult.innerHTML = '<div class="loading">Gerando programação...</div>';

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: date,
                    participants: participants.split(',').map(p => p.trim()).filter(p => p)
                })
            });

            const data = await response.json();

            if (data.success) {
                displaySchedule(data.schedule);
            } else {
                showError(data.error || 'Erro ao gerar programação');
            }
        } catch (error) {
            showError('Erro de conexão: ' + error.message);
        }
    });

    function displaySchedule(schedule) {
        let html = '<h3>Programação para Reunião Vida e Ministério</h3>';
        html += '<div class="schedule-content">';
        
        if (schedule.date) {
            const date = new Date(schedule.date);
            html += `<p><strong>Data:</strong> ${date.toLocaleDateString('pt-BR')}</p>`;
        }
        
        if (schedule.content) {
            html += '<div class="schedule-details">';
            html += schedule.content.replace(/\n/g, '<br>');
            html += '</div>';
        }
        
        if (schedule.participants && schedule.participants.length > 0) {
            html += '<p><strong>Participantes:</strong> ' + schedule.participants.join(', ') + '</p>';
        }
        
        html += '</div>';
        scheduleResult.innerHTML = html;
    }

    function showError(message) {
        scheduleResult.innerHTML = `<div class="error">${message}</div>`;
    }
});
