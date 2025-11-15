@echo off
REM Script de deploy para Windows
REM Uso: deploy.bat [netlify|vercel|docker]

setlocal

set DEPLOY_TYPE=%1
if "%DEPLOY_TYPE%"=="" set DEPLOY_TYPE=netlify

echo 🚀 Iniciando deploy para %DEPLOY_TYPE%...

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não está instalado
    exit /b 1
)

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm ci
)

REM Verificar se a chave da API está configurada
if "%GEMINI_API_KEY%"=="" (
    echo ⚠️  AVISO: GEMINI_API_KEY não está definida
    echo    Configure a variável de ambiente antes do deploy
)

REM Limpar builds anteriores
echo 🧹 Limpando builds anteriores...
if exist "dist" rmdir /s /q dist
if exist "build" rmdir /s /q build
if exist ".cache" rmdir /s /q .cache

REM Type checking
echo 🔍 Verificando tipos TypeScript...
npm run type-check
if errorlevel 1 (
    echo ❌ Erro na verificação de tipos
    exit /b 1
)

if "%DEPLOY_TYPE%"=="netlify" (
    echo 🌐 Preparando deploy para Netlify...
    npm run deploy:netlify
    echo ✅ Build pronto! Faça upload da pasta 'dist' para Netlify
    echo    Ou conecte seu repositório Git ao Netlify para deploy automático
) else if "%DEPLOY_TYPE%"=="vercel" (
    echo ▲ Preparando deploy para Vercel...
    npm run deploy:vercel
    echo ✅ Build pronto! Execute 'vercel --prod' para fazer deploy
    echo    Ou conecte seu repositório Git ao Vercel para deploy automático
) else if "%DEPLOY_TYPE%"=="docker" (
    echo 🐳 Verificando se Docker está instalado...
    docker --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker não está instalado
        exit /b 1
    )
    
    echo 🐳 Criando imagem Docker...
    docker build -t rvm-designacoes:latest .
    if errorlevel 1 (
        echo ❌ Erro ao criar imagem Docker
        exit /b 1
    )
    
    echo ✅ Imagem Docker criada! Execute:
    echo    docker run -p 3000:80 rvm-designacoes:latest
    echo    ou use docker-compose up para deploy completo
) else (
    echo ❌ Tipo de deploy inválido: %DEPLOY_TYPE%
    echo    Opções válidas: netlify, vercel, docker
    exit /b 1
)

echo.
echo 🎉 Deploy preparado com sucesso!

if exist "dist" (
    echo 📊 Build gerado na pasta 'dist'
)

echo.
echo 📋 Próximos passos:
echo    1. Configure GEMINI_API_KEY na plataforma de deploy
echo    2. Verifique se o domínio está configurado corretamente
echo    3. Teste a aplicação após o deploy
echo    4. Configure monitoramento se necessário

endlocal