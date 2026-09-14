@echo off
chcp 65001 >nul
REM راه‌انداز سامانه کارتابل
REM اگر پروسه قدیمی Vite یا فایل hot موجود باشد، پاک می‌کند تا صفحه از build اصلی لود شود

cd /d D:\project\kartabl

if exist public\hot del public\hot

REM بستن هر vite قدیمی روی پورت 5173 (اگر باشد)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo [1/2] Build frontend...
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

echo [2/2] Starting server at http://localhost:8000 ...
C:\wamp64\bin\php\php8.2.26\php.exe -d xdebug.mode=off artisan serve
pause
