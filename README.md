# app-rvm-programacaoIA-GAIS-v4

![Banner do projeto](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

Este repositório contém tudo o que você precisa para executar e implantar o aplicativo IA Studio localmente.

Visualize o app direto no [AI Studio](https://ai.studio/apps/drive/1Xmc6QXd3JiPpla0PwBqqjVAwcSORUoJh).

## Executar localmente

**Pré-requisitos:** Node.js 18+

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure `GEMINI_API_KEY` (ex.: crie um arquivo `.env.local` ou defina a variável de ambiente):

   ```bash
   echo GEMINI_API_KEY=seu_token > .env.local
   ```

3. Rode o app em modo desenvolvimento:

   ```bash
   npm run dev
   ```

## Build e deploy

Para gerar a versão de produção:

```bash
npm run build:production
```

Os artefatos serão gerados em `dist/` e podem ser enviados para Netlify, Vercel ou servidos via Docker/nginx conforme descrito em `DEPLOY.md`.
