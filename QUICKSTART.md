# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install
```bash
git clone https://github.com/EliezerRosa/app-rvm-programacaoIA-GAIS-v4.git
cd app-rvm-programacaoIA-GAIS-v4
pip install -r requirements.txt
```

### 2. Run
```bash
python app.py
```

### 3. Use
Open your browser at `http://localhost:5000`

## 📝 Basic Usage

### Web Interface
1. Enter the meeting date
2. Add participant names (comma-separated)
3. Click "Gerar Programação"
4. View your generated schedule!

### API Usage

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Generate Schedule:**
```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-01",
    "participants": ["João", "Maria", "Pedro"]
  }'
```

## ⚙️ Configuration

Create a `.env` file (optional):
```env
OPENAI_API_KEY=your_key_here  # Optional - for AI features
FLASK_DEBUG=1                 # Development mode
PORT=5000                     # Server port
```

## 🧪 Testing

Run tests:
```bash
python -m unittest discover -s tests -v
```

## 📚 Learn More

- Full Documentation: [README.md](README.md)
- Deployment Guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Version History: [CHANGELOG.md](CHANGELOG.md)

## 🆘 Troubleshooting

**Port already in use?**
```bash
PORT=5001 python app.py
```

**Missing dependencies?**
```bash
pip install -r requirements.txt
```

**Need help?**
Open an issue on GitHub!

## 🎯 Features at a Glance

- ✅ Automatic schedule generation
- ✅ AI-powered assignments (optional)
- ✅ Works without AI (mock generator)
- ✅ Modern web interface
- ✅ RESTful API
- ✅ Portuguese language support
- ✅ Mobile responsive
- ✅ Easy to deploy

---

**Version**: 4.0.0 | **License**: MIT | **Author**: [@EliezerRosa](https://github.com/EliezerRosa)
