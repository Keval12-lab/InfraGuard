@echo off
setlocal

set "ROOT_DIR=%~dp0.."
set "BACKEND_DIR=%ROOT_DIR%\backend"

cls
echo ========================================
echo InfraGuard Development Startup
echo ========================================
echo.

if not exist "%BACKEND_DIR%\.venv\Scripts\python.exe" (
    echo [ERROR] Backend virtual environment was not found.
    echo Expected: %BACKEND_DIR%\.venv\Scripts\python.exe
    echo.
    pause
    exit /b 1
)

if not exist "%ROOT_DIR%\node_modules" (
    echo [ERROR] Frontend dependencies were not found.
    echo Run npm.cmd install from: %ROOT_DIR%
    echo.
    pause
    exit /b 1
)

echo [1/3] Starting Flask backend on http://localhost:5000 ...
start "InfraGuard Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && echo InfraGuard backend is starting... && .\.venv\Scripts\python.exe -m flask --app app run --host localhost --port 5000 --debug"

echo [2/3] Starting React frontend on http://localhost:5173 ...
start "InfraGuard Frontend" cmd /k "cd /d ""%ROOT_DIR%"" && echo InfraGuard frontend is starting... && npm.cmd run dev:frontend"

echo [3/3] Opening browser ...
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo InfraGuard development environment is starting.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Use tools\stop.bat to stop the development servers.
echo.
pause
endlocal