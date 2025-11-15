# Deployment Guide

## Production Deployment

### Prerequisites
- Python 3.8+
- pip
- Virtual environment (recommended)
- Web server (gunicorn recommended for production)

### Steps

1. **Clone and Setup**
```bash
git clone https://github.com/EliezerRosa/app-rvm-programacaoIA-GAIS-v4.git
cd app-rvm-programacaoIA-GAIS-v4
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Install Production Server**
```bash
pip install gunicorn
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your settings
# IMPORTANT: Set FLASK_DEBUG=0 for production
```

4. **Run with Gunicorn**
```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Security Checklist

- [ ] Set `FLASK_DEBUG=0` in production
- [ ] Use HTTPS with SSL certificates
- [ ] Set strong secret keys
- [ ] Configure firewall rules
- [ ] Keep dependencies updated
- [ ] Use environment variables for sensitive data
- [ ] Implement rate limiting
- [ ] Configure CORS properly if needed

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

ENV FLASK_DEBUG=0
ENV PORT=8000

EXPOSE 8000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
```

Build and run:
```bash
docker build -t rvm-app .
docker run -p 8000:8000 -e OPENAI_API_KEY=your_key rvm-app
```

### Environment Variables for Production

```env
OPENAI_API_KEY=your_actual_api_key
FLASK_ENV=production
FLASK_DEBUG=0
PORT=8000
```

### Monitoring

Consider adding:
- Application logs monitoring
- Error tracking (e.g., Sentry)
- Performance monitoring
- Uptime monitoring

### Backup

Regularly backup:
- Configuration files
- Environment variables (securely)
- Generated schedules data (if stored)
