# app-rvm-programacaoIA-GAIS-v4

Sistema de Programação Automática para Reunião Vida e Ministério usando Inteligência Artificial - Versão 4.0

## 📋 Descrição

O RVM Programming AI GAIS v4 é uma aplicação web desenvolvida para automatizar a geração de programações para a Reunião Vida e Ministério, utilizando inteligência artificial para criar designações equilibradas e organizadas.

## ✨ Funcionalidades

- 🤖 Geração automática de programações usando IA
- 📅 Criação de programações por data
- 👥 Distribuição automática de designações entre participantes
- 🎵 Sugestão de cânticos
- 📱 Interface responsiva e intuitiva
- ⚡ API REST para integração

## 🚀 Tecnologias

- **Backend**: Python 3.x + Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **IA**: OpenAI GPT (opcional)
- **Estilo**: CSS moderno com gradientes

## 📦 Instalação

### Pré-requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/EliezerRosa/app-rvm-programacaoIA-GAIS-v4.git
cd app-rvm-programacaoIA-GAIS-v4
```

2. Crie um ambiente virtual (recomendado):
```bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env e adicione sua chave da API OpenAI (opcional)
```

5. Execute a aplicação:
```bash
python app.py
```

A aplicação estará disponível em `http://localhost:5000`

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
OPENAI_API_KEY=sua_chave_api_aqui  # Opcional - para usar IA
FLASK_ENV=development
FLASK_DEBUG=1
PORT=5000
```

**Nota**: A aplicação funciona sem a chave da API OpenAI, usando um gerador de programações simplificado.

## 📖 Uso

### Interface Web

1. Acesse `http://localhost:5000` no navegador
2. Selecione a data da reunião
3. Adicione os participantes (separados por vírgula)
4. Clique em "Gerar Programação"
5. A programação será gerada e exibida na tela

### API REST

#### Health Check
```bash
GET /api/health
```

Resposta:
```json
{
  "status": "healthy",
  "version": "4.0.0",
  "ai_enabled": true
}
```

#### Gerar Programação
```bash
POST /api/generate
Content-Type: application/json

{
  "date": "2025-11-20",
  "participants": ["João Silva", "Maria Santos", "Pedro Costa"]
}
```

Resposta:
```json
{
  "success": true,
  "message": "Schedule generated successfully",
  "schedule": {
    "date": "2025-11-20",
    "content": "Programação detalhada...",
    "participants": ["João Silva", "Maria Santos", "Pedro Costa"]
  }
}
```

## 🏗️ Estrutura do Projeto

```
app-rvm-programacaoIA-GAIS-v4/
├── app.py                  # Aplicação principal Flask
├── requirements.txt        # Dependências Python
├── .env.example           # Exemplo de configuração
├── .gitignore            # Arquivos ignorados pelo Git
├── README.md             # Este arquivo
├── config/
│   ├── __init__.py
│   └── settings.py       # Configurações da aplicação
├── services/
│   ├── __init__.py
│   └── ai_service.py     # Serviço de geração com IA
├── static/
│   ├── css/
│   │   └── style.css     # Estilos da aplicação
│   └── js/
│       └── main.js       # JavaScript frontend
└── templates/
    └── index.html        # Template HTML principal
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👨‍💻 Autor

**EliezerRosa**
- GitHub: [@EliezerRosa](https://github.com/EliezerRosa)

## 🙏 Agradecimentos

- Comunidade das Testemunhas de Jeová
- Projeto inspirado em RVM-Designacoes

## 📞 Suporte

Para questões e suporte, abra uma issue no GitHub.

---

**Versão**: 4.0.0  
**Data**: 2025  
**Status**: ✅ Ativo
