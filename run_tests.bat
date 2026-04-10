@echo off
echo ==========================================
echo DANG CHAY KIEM THU (TESTING) TOAN DU AN...
echo ==========================================

:: Chay Backend Test
echo.
echo 1/2: Dang chay Backend Tests...
cd backend
..\venv\Scripts\python manage.py test tests > ..\reports\backend-results.txt 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend tests hoan thanh.
) else (
    echo [LOI] Backend tests gap van de.
)
cd ..

:: Chay Frontend Test
echo.
echo 2/2: Dang chay Frontend Tests...
cd frontend
npm run test -- --run > ..\reports\frontend-raw-log.txt 2>&1
echo [OK] Frontend tests hoan thanh.
cd ..

echo.
echo ==========================================
echo KIEM THU HOAN TAT!
echo Xem ket qua tai:
echo - Backend: reports\backend-results.txt
echo - Frontend: reports\frontend-report.html (Mo bang trinh duyet)
echo ==========================================
pause
