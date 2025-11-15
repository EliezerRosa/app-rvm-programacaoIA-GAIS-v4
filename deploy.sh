#!/bin/bash

# Script de deploy para produção
# Uso: ./deploy.sh [netlify|vercel|docker]

set -e

DEPLOY_TYPE=${1:-"netlify"}
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "🚀 Iniciando deploy para $DEPLOY_TYPE em $DATE"

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm ci
fi

# Verificar se a chave da API está configurada
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  AVISO: GEMINI_API_KEY não está definida"
    echo "   Configure a variável de ambiente antes do deploy"
fi

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
npm run clean 2>/dev/null || rm -rf dist build .cache

# Type checking
echo "🔍 Verificando tipos TypeScript..."
npm run type-check

case $DEPLOY_TYPE in
    "netlify")
        echo "🌐 Preparando deploy para Netlify..."
        npm run deploy:netlify
        echo "✅ Build pronto! Faça upload da pasta 'dist' para Netlify"
        echo "   Ou conecte seu repositório Git ao Netlify para deploy automático"
        ;;
        
    "vercel")
        echo "▲ Preparando deploy para Vercel..."
        npm run deploy:vercel
        echo "✅ Build pronto! Execute 'vercel --prod' para fazer deploy"
        echo "   Ou conecte seu repositório Git ao Vercel para deploy automático"
        ;;
        
    "docker")
        echo "🐳 Criando imagem Docker..."
        docker build -t rvm-designacoes:latest .
        echo "✅ Imagem Docker criada! Execute:"
        echo "   docker run -p 3000:80 rvm-designacoes:latest"
        echo "   ou use docker-compose up para deploy completo"
        ;;
        
    *)
        echo "❌ Tipo de deploy inválido: $DEPLOY_TYPE"
        echo "   Opções válidas: netlify, vercel, docker"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deploy preparado com sucesso!"
echo "📊 Estatísticas do build:"

if [ -d "dist" ]; then
    echo "   📁 Tamanho da pasta dist: $(du -sh dist | cut -f1)"
    echo "   📄 Arquivos gerados: $(find dist -type f | wc -l)"
fi

echo ""
echo "📋 Próximos passos:"
echo "   1. Configure GEMINI_API_KEY na plataforma de deploy"
echo "   2. Verifique se o domínio está configurado corretamente"
echo "   3. Teste a aplicação após o deploy"
echo "   4. Configure monitoramento se necessário"