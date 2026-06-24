@echo off
echo Starting Spring Boot Backend...
start cmd /k "cd /d C:\Users\Admin\Desktop\floodwatch-community-main\backend && mvn clean spring-boot:run"

timeout /t 30 >nul

echo Starting Frontend Server...
start cmd /k "cd /d C:\Users\Admin\Desktop\floodwatch-community-main\frontend && npm run dev"


