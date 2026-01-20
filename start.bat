@echo off
REM Quick Start Script for University Library System
REM This script helps start both backend and frontend

echo.
echo ========================================
echo University Library System - Quick Start
echo ========================================
echo.

REM Check if backend is running
echo Checking backend (port 8080)...
netstat -ano | findstr :8080 >nul
if %errorlevel%==0 (
    echo [OK] Backend is running on port 8080
) else (
    echo [STARTING] Backend...
    start cmd /k "cd /d %~dp0 && gradlew bootRun"
    timeout /t 5 /nobreak
)

REM Check if frontend is running
echo Checking frontend (port 3000)...
netstat -ano | findstr :3000 >nul
if %errorlevel%==0 (
    echo [OK] Frontend is running on port 3000
) else (
    echo [STARTING] Frontend...
    start cmd /k "cd /d %~dp0frontend && npm start"
    timeout /t 5 /nobreak
)

echo.
echo ========================================
echo Application Ready!
echo ========================================
echo.
echo Access the application:
echo - Laptop/Desktop: http://localhost:3000
echo.
echo For mobile testing on local network:
echo - Find your laptop IP: ipconfig (look for IPv4 Address)
echo - On phone: http://your-laptop-ip:3000
echo.
echo Note: Mobile camera requires HTTPS
echo       Use manual QR entry as fallback for HTTP
echo.
echo ========================================
echo.
pause
