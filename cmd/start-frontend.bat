@echo off
rem quick-study frontend start script (Windows)
rem Located in the standalone frontend repo (D:\repo\quick-study-frontend)
rem Vue3 + Vite, port 5173, /api proxied to http://localhost:8080 (start backend first)
setlocal

cd /d "%~dp0.."

if not exist node_modules (
  echo [frontend] node_modules not found, running npm install
  call npm install
)

echo [frontend] Starting Vite dev server (port 5173, /api -^> http://localhost:8080)
call npm run dev

endlocal