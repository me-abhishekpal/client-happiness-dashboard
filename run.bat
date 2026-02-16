@echo off
TITLE Client Happiness Dashboard
echo 🚀 Starting Client Happiness Dashboard...

:: 1. Install dependencies
if not exist node_modules (
    echo 📦 Installing root dependencies...
    call npm install
)
if not exist frontend\node_modules (
    echo 📦 Installing frontend dependencies...
    cd frontend && call npm install && cd ..
)

:: 2. Generate Prisma Client
echo 🏗️ Generating Prisma Client...
call npm run prisma:generate

:: 3. Sync Database
echo 🗄️ Syncing database...
call npm run prisma:push

:: 4. Start Development Server
echo ✨ Starting development server...
call npm run dev
