@echo off
echo Starting Environmental Monitoring App...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0 && node server/simple-server.js"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0client && npm start"

echo.
echo Environmental Monitoring App is starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
