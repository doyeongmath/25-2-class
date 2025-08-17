@echo off
chcp 65001 >nul
echo 🚀 GitHub에 push 중...
echo.

cd /d "%~dp0"

echo Git 상태 확인...
git status
echo.

echo 변경사항 추가 및 커밋...
git add .
git commit -m "업데이트: %date% %time%"

echo GitHub에 push...
git push origin main

if %errorlevel% equ 0 (
    echo ✅ Push 완료!
) else (
    echo ❌ Push 실패!
)

pause
