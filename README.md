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

### Deploy rápido no Netlify

1. **Crie um site** em <https://app.netlify.com/> usando "Add new site → Deploy manually" ou conecte este repositório via Git.
2. **Configure a variável de ambiente:** em *Site settings → Build & deploy → Environment* adicione `GEMINI_API_KEY` com o mesmo token usado localmente.
3. **Defina o build (caso use Git connect):**
   - Build command: `npm run build:production`
   - Publish directory: `dist`
   - Node version: `18`
4. **Fazendo upload manual:** após `npm run build:production`, faça upload da pasta `dist/` ou use `netlify deploy --dir=dist --prod` com o Netlify CLI.
5. **Teste após o deploy:** abra a URL gerada e confirme que as funcionalidades dependentes da IA funcionam (IA Scheduler, formulários, etc.).

Se preferir outra infra (Vercel, Docker ou nginx), consulte os detalhes em `DEPLOY.md`.
