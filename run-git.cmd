@echo off
set TEMP=E:\temp
set TMP=E:\temp
if not exist E:\temp mkdir E:\temp
cd /d E:\e-PTW
if not exist .git git init -b main
git add -A
git diff --cached --quiet || git commit -m "SMA e-Permit Portal — phases 2-6"
git remote get-url origin 2>nul || git remote add origin https://github.com/lodhimehrose/e-PTW.git
git push -u origin main > E:\temp\git-push.log 2>&1
echo EXIT=%ERRORLEVEL%>> E:\temp\git-push.log
