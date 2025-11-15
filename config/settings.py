"""
Configuration for RVM Programming AI GAIS v4
"""

# RVM Meeting structure
MEETING_PARTS = {
    'treasures': {
        'name': 'Tesouros da Palavra de Deus',
        'duration': 10,
        'parts': [
            'Discurso',
            'Joias Espirituais',
            'Leitura da Bíblia'
        ]
    },
    'ministry': {
        'name': 'Faça Seu Melhor no Ministério',
        'duration': 15,
        'parts': [
            'Primeira Conversa',
            'Revisita',
            'Estudo Bíblico'
        ]
    },
    'christian_life': {
        'name': 'Nossa Vida Cristã',
        'duration': 30,
        'parts': [
            'Parte 1',
            'Parte 2',
            'Estudo Bíblico de Congregação',
            'Considerações Finais'
        ]
    }
}

# Songs configuration
SONGS = {
    'initial': list(range(1, 158)),
    'intermediate': list(range(1, 158)),
    'final': list(range(1, 158))
}

# Application version
VERSION = '4.0.0'
