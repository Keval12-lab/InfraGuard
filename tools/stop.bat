@echo off
setlocal enabledelayedexpansion

cls
echo ========================================
echo InfraGuard Development Shutdown
echo ========================================
echo.

echo Stopping InfraGuard terminal windows...
taskkill /FI "WINDOWTITLE eq InfraGuard Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq InfraGuard Frontend*" /T /F >nul 2>&1

echo Releasing development ports...
for %%P in (5000 5173) do (
    for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
        if not "%%A"=="0" (
            taskkill /PID %%A /T /F >nul 2>&1
        )
    )
)

echo.
echo InfraGuard development servers have been stopped.
echo.
pause
endlocal