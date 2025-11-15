"""
AI Service for RVM Schedule Generation
"""

import os
import logging
from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIScheduleGenerator:
    def __init__(self):
        self.client = None
        api_key = os.getenv('OPENAI_API_KEY')
        if api_key and api_key != 'your_api_key_here':
            self.client = OpenAI(api_key=api_key)
    
    def generate_schedule(self, date, participants):
        """
        Generate RVM schedule using AI
        
        Args:
            date: Meeting date
            participants: List of participant names
            
        Returns:
            dict: Generated schedule
        """
        if not self.client:
            return self._generate_mock_schedule(date, participants)
        
        try:
            # Create AI prompt for schedule generation
            prompt = self._create_prompt(date, participants)
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Você é um assistente especializado em criar programações para a Reunião Vida e Ministério."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            return {
                'date': date,
                'content': response.choices[0].message.content,
                'participants': participants
            }
        except Exception as e:
            logger.error(f"AI generation error: {e}")
            return self._generate_mock_schedule(date, participants)
    
    def _create_prompt(self, date, participants):
        """Create prompt for AI schedule generation"""
        participants_text = ", ".join(participants) if participants else "nenhum especificado"
        
        return f"""
        Crie uma programação para a Reunião Vida e Ministério para a data {date}.
        
        Participantes disponíveis: {participants_text}
        
        A programação deve incluir:
        1. Cânticos (inicial, intermediário, final)
        2. Tesouros da Palavra de Deus (10 min)
        3. Faça Seu Melhor no Ministério (15 min)
        4. Nossa Vida Cristã (30 min)
        
        Distribua as designações entre os participantes de forma equilibrada.
        Formate a resposta de maneira clara e organizada.
        """
    
    def _generate_mock_schedule(self, date, participants):
        """Generate a mock schedule when AI is not available"""
        parts = [
            "Tesouros da Palavra de Deus",
            "Faça Seu Melhor no Ministério",
            "Nossa Vida Cristã"
        ]
        
        schedule_content = f"Programação para {date}\n\n"
        schedule_content += "CÂNTICOS: 1, 50, 135\n\n"
        
        for i, part in enumerate(parts):
            participant = participants[i % len(participants)] if participants else "A designar"
            schedule_content += f"{i+1}. {part}: {participant}\n"
        
        return {
            'date': date,
            'content': schedule_content,
            'participants': participants
        }
