"""
RVM Programming AI GAIS v4
Sistema de programação automática para Reunião Vida e Ministério usando IA
"""

from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os
from services.ai_service import AIScheduleGenerator
from config.settings import VERSION

# Load environment variables
load_dotenv()

app = Flask(__name__)
ai_generator = AIScheduleGenerator()

@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/api/generate', methods=['POST'])
def generate_schedule():
    """Generate RVM schedule using AI"""
    try:
        data = request.json
        date = data.get('date')
        participants = data.get('participants', [])
        
        if not date:
            return jsonify({
                'success': False,
                'error': 'Data da reunião é obrigatória'
            }), 400
        
        # Generate schedule using AI
        schedule = ai_generator.generate_schedule(date, participants)
        
        result = {
            'success': True,
            'message': 'Schedule generated successfully',
            'schedule': schedule
        }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': VERSION,
        'ai_enabled': ai_generator.client is not None
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
