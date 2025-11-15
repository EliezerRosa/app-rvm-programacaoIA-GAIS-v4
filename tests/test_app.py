"""
Tests for RVM Programming AI GAIS v4
"""

import unittest
import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from services.ai_service import AIScheduleGenerator


class TestApp(unittest.TestCase):
    """Test Flask application"""
    
    def setUp(self):
        """Set up test client"""
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
    
    def test_home_page(self):
        """Test home page loads"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'RVM Programming AI GAIS v4', response.data)
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['version'], '4.0.0')
        self.assertIn('ai_enabled', data)
    
    def test_generate_schedule_success(self):
        """Test schedule generation with valid data"""
        response = self.client.post(
            '/api/generate',
            data=json.dumps({
                'date': '2025-11-20',
                'participants': ['João Silva', 'Maria Santos']
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('schedule', data)
        self.assertIn('date', data['schedule'])
        self.assertIn('content', data['schedule'])
    
    def test_generate_schedule_missing_date(self):
        """Test schedule generation without date"""
        response = self.client.post(
            '/api/generate',
            data=json.dumps({
                'participants': ['João Silva']
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('error', data)


class TestAIService(unittest.TestCase):
    """Test AI Schedule Generator"""
    
    def setUp(self):
        """Set up AI service"""
        self.generator = AIScheduleGenerator()
    
    def test_generate_schedule(self):
        """Test schedule generation"""
        schedule = self.generator.generate_schedule(
            '2025-11-20',
            ['João Silva', 'Maria Santos', 'Pedro Costa']
        )
        
        self.assertIn('date', schedule)
        self.assertIn('content', schedule)
        self.assertIn('participants', schedule)
        self.assertEqual(schedule['date'], '2025-11-20')
        self.assertEqual(len(schedule['participants']), 3)
    
    def test_generate_schedule_no_participants(self):
        """Test schedule generation without participants"""
        schedule = self.generator.generate_schedule('2025-11-20', [])
        
        self.assertIn('date', schedule)
        self.assertIn('content', schedule)
        self.assertIsNotNone(schedule['content'])


if __name__ == '__main__':
    unittest.main()
