@echo off
echo Starting FarmConnect...
echo.

REM Kill any existing process on port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Stopping existing server...
    taskkill /PID %%a /F >nul 2>nul
)

REM Kill any existing process on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Stopping existing frontend...
    taskkill /PID %%a /F >nul 2>nul
)

echo Starting full development environment...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3001 (or 3000 if available)
echo Browser will open automatically when ready...
echo Press Ctrl+C to stop both servers
echo.

REM Start a timer to open browser after delay
start /B timeout /t 8 /nobreak >nul && start http://localhost:5000

REM Start both frontend and backend servers
npm run dev:full
