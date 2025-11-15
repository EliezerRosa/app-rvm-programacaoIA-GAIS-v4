# 🚀 Guia de Deploy - Sistema de Designações RVM

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Chave da API do Google Gemini
- Conta em uma das plataformas de deploy (Netlify, Vercel, ou Docker)

## 🔑 Configuração da API

1. Obtenha sua chave da API do Google Gemini:
   - Acesse: https://makersuite.google.com/app/apikey
   - Crie uma nova chave da API
   - Copie a chave gerada

2. Configure a variável de ambiente:
   ```bash
   # No seu ambiente local
   export GEMINI_API_KEY=sua_chave_aqui
   
   # No Windows
   set GEMINI_API_KEY=sua_chave_aqui
   ```

## 🚀 Opções de Deploy

### Opção 1: Netlify (Recomendado para iniciantes)

#### Deploy Manual:
```bash
# Windows
deploy.bat netlify

# Linux/Mac
./deploy.sh netlify
```

#### Deploy Automático via Git:
1. Faça push do código para GitHub/GitLab
2. Conecte seu repositório ao Netlify
3. Configure a variável `GEMINI_API_KEY` no painel do Netlify
4. Deploy automático será feito a cada push

### Opção 2: Vercel

#### Deploy com Vercel CLI:
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel --prod
```

#### Deploy Automático via Git:
1. Conecte seu repositório ao Vercel
2. Configure a variável `GEMINI_API_KEY` no painel do Vercel
3. Deploy automático será feito a cada push

### Opção 3: Docker

#### Build e execução local:
```bash
# Windows
deploy.bat docker

# Linux/Mac
./deploy.sh docker

# Executar container
docker run -p 3000:80 -e GEMINI_API_KEY=sua_chave rvm-designacoes:latest
```

#### Usando Docker Compose:
```bash
# Criar arquivo .env com GEMINI_API_KEY=sua_chave
docker-compose up -d
```

#### Deploy em servidor:
```bash
# Fazer build da imagem
docker build -t rvm-designacoes .

# Executar em produção
docker run -d \
  --name rvm-app \
  -p 80:80 \
  -e GEMINI_API_KEY=sua_chave \
  --restart unless-stopped \
  rvm-designacoes:latest
```

## 🔧 Configurações Avançadas

### Variáveis de Ambiente Suportadas:

- `GEMINI_API_KEY`: **(Obrigatório)** Chave da API do Google Gemini
- `NODE_ENV`: Ambiente de execução (production/development)
- `VITE_APP_NAME`: Nome da aplicação (padrão: "Sistema de Designações RVM")
- `VITE_APP_VERSION`: Versão da aplicação
- `VITE_DEBUG`: Habilitar logs de debug (true/false)

### Headers de Segurança:

O deploy inclui automaticamente:
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy configurado

### Cache e Performance:

- Arquivos estáticos: Cache de 1 ano
- HTML: Cache de 5 minutos
- Compressão Gzip habilitada
- Service Worker para cache offline (em desenvolvimento)

## 🔍 Verificação do Deploy

Após o deploy, verifique:

1. **Aplicação carrega corretamente**:
   ```
   https://seu-dominio.com
   ```

2. **Health check (Docker)**:
   ```
   https://seu-dominio.com/health
   ```

3. **Console do navegador** sem erros críticos

4. **Funcionalidades principais**:
   - Cadastro de publicadores
   - Criação de designações
   - Geração de pautas com IA
   - Upload de apostilas

## 🚨 Troubleshooting

### Erro: "API Key not configured"
- Verifique se `GEMINI_API_KEY` está configurada
- Confirme que a chave é válida no Google AI Studio

### Build falha no tipo checking:
```bash
npm run type-check
# Corrigir erros reportados
```

### Aplicação não carrega:
- Verifique se o build foi gerado corretamente
- Confirme se o servidor está redirecionando /* para /index.html
- Verifique console do navegador para erros

### Docker não inicia:
```bash
# Verificar logs
docker logs container-name

# Verificar se a porta está livre
netstat -tlnp | grep :80
```

## 📊 Monitoramento

### Logs de Aplicação:
- Netlify: Painel Functions > Logs
- Vercel: Painel Functions > Logs  
- Docker: `docker logs container-name`

### Performance:
- Google PageSpeed Insights
- GTmetrix
- Lighthouse (integrado no Chrome DevTools)

### Uptime:
- UptimeRobot
- Pingdom
- StatusPage

## 🔄 Atualizações

### Deploy de nova versão:

1. **Git-based** (Netlify/Vercel):
   ```bash
   git push origin main
   # Deploy automático
   ```

2. **Docker**:
   ```bash
   # Rebuild imagem
   docker build -t rvm-designacoes:latest .
   
   # Recrear container
   docker stop rvm-app
   docker rm rvm-app
   docker run -d --name rvm-app -p 80:80 rvm-designacoes:latest
   ```

### Rollback:
- **Netlify/Vercel**: Use o painel para fazer rollback
- **Docker**: Manter tags de versão e fazer rollback para tag anterior

## 🆘 Suporte

Para problemas de deploy:

1. Verifique os logs da plataforma
2. Confirme as variáveis de ambiente
3. Teste o build localmente: `npm run build:production`
4. Verifique a documentação da plataforma de deploy

---

## 📞 Contatos de Suporte

- **Netlify**: https://docs.netlify.com/
- **Vercel**: https://vercel.com/docs
- **Docker**: https://docs.docker.com/

**Boa sorte com o deploy! 🎉**