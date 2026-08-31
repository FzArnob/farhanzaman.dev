@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem ===========================================================================
rem  Full production build.
rem
rem  Produces build\release_<timestamp>\ holding the complete deployable site:
rem
rem    index.html  assets\  view\  data\  .htaccess     <- frontend (Vite)
rem    backend\                                          <- PHP APIs
rem    admin\                                            <- PHP content editor
rem
rem  Usage:  build.bat [--skip-install]
rem            --skip-install   reuse the existing node_modules instead of npm ci
rem ===========================================================================

set "BUILD_DIR=%~dp0"
if "%BUILD_DIR:~-1%"=="\" set "BUILD_DIR=%BUILD_DIR:~0,-1%"
for %%I in ("%BUILD_DIR%\..") do set "ROOT=%%~fI"

set "SKIP_INSTALL="
if /I "%~1"=="--skip-install" set "SKIP_INSTALL=1"

echo.
echo ===============================================================
echo   Portfolio 1.09 - production build
echo ===============================================================
echo   source : %ROOT%

rem --- timestamp (locale independent) ---------------------------------------
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"`) do set "STAMP=%%I"
if not defined STAMP (
  echo   [ERROR] Could not read the current date/time.
  goto :fail
)
set "RELEASE=%BUILD_DIR%\release_%STAMP%"
echo   target : %RELEASE%
echo.

rem ---------------------------------------------------------------- 1. checks
echo [1/9] Checking prerequisites

where node >nul 2>&1
if errorlevel 1 (
  echo   [ERROR] node is not on PATH.
  goto :fail
)
where npm >nul 2>&1
if errorlevel 1 (
  echo   [ERROR] npm is not on PATH.
  goto :fail
)
for %%D in (frontend backend admin data) do (
  if not exist "%ROOT%\%%D\" (
    echo   [ERROR] Missing source folder: %ROOT%\%%D
    goto :fail
  )
)
if not exist "%ROOT%\data\profile.json" (
  echo   [ERROR] Missing data\profile.json
  goto :fail
)
if not exist "%ROOT%\frontend\public\.htaccess" (
  echo   [ERROR] Missing frontend\public\.htaccess - SPA routing would break.
  goto :fail
)
for /f "usebackq delims=" %%I in (`node --version`) do set "NODE_VER=%%I"
echo   node %NODE_VER% - all source folders present
echo.

rem ------------------------------------------------------------- 2. node deps
echo [2/9] Installing frontend dependencies
pushd "%ROOT%\frontend" || goto :fail
if defined SKIP_INSTALL (
  echo   skipped - using the existing node_modules
) else (
  if exist "package-lock.json" (
    call npm ci --no-audit --no-fund
  ) else (
    call npm install --no-audit --no-fund
  )
  if errorlevel 1 (
    popd
    echo   [ERROR] Dependency install failed.
    goto :fail
  )
)
echo.

rem ----------------------------------------------------------- 3. clean build
echo [3/9] Building the frontend in production mode
if exist "dist" rmdir /s /q "dist"
call npm run build -- --mode production
if errorlevel 1 (
  popd
  echo   [ERROR] Frontend build failed.
  goto :fail
)
popd
echo.

rem -------------------------------------------------------- 4. verify the dist
echo [4/9] Verifying build output
for %%F in ("index.html" ".htaccess" "data\profile.json" "data\gaming_videos.json") do (
  if not exist "%ROOT%\frontend\dist\%%~F" (
    echo   [ERROR] Build output is missing %%~F
    goto :fail
  )
)
if not exist "%ROOT%\frontend\dist\view\static\favicon.svg" (
  echo   [ERROR] Build output is missing the view\static assets.
  goto :fail
)

rem The API host must come from profile.json, never from a local .env override.
findstr /I /C:"localhost" "%ROOT%\frontend\dist\assets\*.js" >nul 2>&1
if not errorlevel 1 (
  echo   [ERROR] A localhost URL leaked into the JS bundle.
  echo           Check VITE_API_HOST handling in src\lib\api.ts.
  goto :fail
)
findstr /C:"index.html [L]" "%ROOT%\frontend\dist\.htaccess" >nul 2>&1
if errorlevel 1 (
  echo   [ERROR] dist\.htaccess has no SPA rewrite - deep links would 404.
  goto :fail
)
echo   index.html, .htaccess with SPA rewrite, data and view assets all present
echo   no localhost URL in the bundle
echo.

rem ------------------------------------------------------- 5. release skeleton
echo [5/9] Creating %RELEASE%
if exist "%RELEASE%" rmdir /s /q "%RELEASE%"
mkdir "%RELEASE%" 2>nul
if not exist "%RELEASE%\" (
  echo   [ERROR] Could not create the release folder.
  goto :fail
)
echo.

rem -------------------------------------------------------------- 6. frontend
echo [6/9] Copying the UI build
robocopy "%ROOT%\frontend\dist" "%RELEASE%" /E /NFL /NDL /NJH /NJS /NP ^
  /XF Thumbs.db .DS_Store *.map >nul
if errorlevel 8 (
  echo   [ERROR] Could not copy the frontend build.
  goto :fail
)
echo   index.html, assets, view, data, .htaccess
echo.

rem --------------------------------------------------------- 7. backend, admin
echo [7/9] Copying backend and admin
robocopy "%ROOT%\backend" "%RELEASE%\backend" /E /NFL /NDL /NJH /NJS /NP ^
  /XD node_modules .git /XF .env .env.* *.log Thumbs.db .DS_Store *.tmp >nul
if errorlevel 8 (
  echo   [ERROR] Could not copy backend.
  goto :fail
)
robocopy "%ROOT%\admin" "%RELEASE%\admin" /E /NFL /NDL /NJH /NJS /NP ^
  /XD node_modules .git /XF .env .env.* *.log Thumbs.db .DS_Store *.tmp _uitest.html >nul
if errorlevel 8 (
  echo   [ERROR] Could not copy admin.
  goto :fail
)
echo   backend\ and admin\
echo.

rem ------------------------------------------------------ 8. production config
echo [8/9] Applying production config overlay
if exist "%BUILD_DIR%\config\" (
  robocopy "%BUILD_DIR%\config" "%RELEASE%" /E /NFL /NDL /NJH /NJS /NP ^
    /XF README.md >nul
  if errorlevel 8 (
    echo   [ERROR] Could not apply the config overlay.
    goto :fail
  )
  echo   overlaid build\config over the release
) else (
  echo   [WARN] build\config not found - shipping the working tree config as is.
)

findstr /C:"'localhost'" "%RELEASE%\backend\config\configDatabase.php" >nul 2>&1
if not errorlevel 1 (
  echo   [WARN] The release database config still points at localhost.
  echo          Edit build\config\backend\config\configDatabase.php.
  set "WARNED=1"
)
echo.

rem ------------------------------------------------------------ 9. final checks
echo [9/9] Verifying the release

for %%F in (
  "index.html"
  ".htaccess"
  "data\profile.json"
  "backend\api\track-visitor.php"
  "backend\api\send-direct-message.php"
  "backend\api\update-gaming-videos.php"
  "backend\sql\ddl\schema.sql"
  "admin\index.php"
  "admin\assets\admin.css"
  "admin\assets\admin.js"
) do (
  if not exist "%RELEASE%\%%~F" (
    echo   [ERROR] Release is missing %%~F
    goto :fail
  )
)
if exist "%RELEASE%\data\backups\" (
  echo   removing data\backups from the release
  rmdir /s /q "%RELEASE%\data\backups"
)

set "PHP_EXE="
where php >nul 2>&1
if not errorlevel 1 set "PHP_EXE=php"
if not defined PHP_EXE if exist "C:\xampp\php\php.exe" set "PHP_EXE=C:\xampp\php\php.exe"

set "PHP_FAIL="
if defined PHP_EXE (
  for /r "%RELEASE%" %%F in (*.php) do (
    "!PHP_EXE!" -l "%%F" >nul 2>&1
    if errorlevel 1 (
      echo   [ERROR] PHP syntax error: %%F
      set "PHP_FAIL=1"
    )
  )
  if defined PHP_FAIL goto :fail
  echo   every PHP file parses cleanly
) else (
  echo   [WARN] php not found - skipped the PHP syntax check.
)

rem --- build notes -----------------------------------------------------------
set "GIT_REV=unknown"
pushd "%ROOT%" >nul 2>&1
for /f "usebackq delims=" %%I in (`git rev-parse --short HEAD 2^>nul`) do set "GIT_REV=%%I"
popd >nul 2>&1

rem Read values through a temp file: cmd mangles parentheses and pipes inside for /f.
set "TMPOUT=%BUILD_DIR%\.buildinfo.tmp"
powershell -NoProfile -Command "$raw = Get-Content -Raw -LiteralPath '%RELEASE%\data\profile.json'; $obj = ConvertFrom-Json -InputObject $raw; $obj.profile.info.website_base_url" > "%TMPOUT%" 2>nul
set "SITE_URL="
if exist "%TMPOUT%" set /p SITE_URL=<"%TMPOUT%"
if not defined SITE_URL set "SITE_URL=see data/profile.json"

(
  echo Portfolio 1.09 - production release
  echo ===================================
  echo.
  echo Built      : %STAMP%
  echo Git commit : %GIT_REV%
  echo Node       : %NODE_VER%
  echo Site URL   : %SITE_URL%
  echo API host   : %SITE_URL%/backend/api
  echo.
  echo Deploy
  echo ------
  echo Upload the entire contents of this folder to the web root, keeping the
  echo layout intact:
  echo.
  echo   webroot/
  echo     index.html, assets/, view/, .htaccess   - the site
  echo     data/                                   - profile.json, gaming_videos.json
  echo     backend/                                - APIs
  echo     admin/                                  - content editor
  echo.
  echo Requirements
  echo ------------
  echo 1. Apache with mod_rewrite and mod_headers enabled.
  echo 2. data/ must be writable by PHP; the admin editor writes profile.json
  echo    and keeps copies under data/backups/.
  echo 3. Run backend/sql/ddl/schema.sql once to create the three tables.
  echo 4. The API host and the footer domain both come from website_base_url and
  echo    website_domain_name inside data/profile.json - change them there only.
  echo.
  echo Admin
  echo -----
  echo Sign in at %SITE_URL%/admin/
  echo.
) > "%RELEASE%\DEPLOY.txt"

for /f %%I in ('dir /s /b /a-d "%RELEASE%" 2^>nul ^| find /c /v ""') do set "FILE_COUNT=%%I"

powershell -NoProfile -Command "$total = 0; $files = Get-ChildItem -Recurse -File -Force -LiteralPath '%RELEASE%'; foreach ($f in $files) { $total += $f.Length }; '{0:N2} MB' -f ($total / 1MB)" > "%TMPOUT%" 2>nul
set "SIZE="
if exist "%TMPOUT%" set /p SIZE=<"%TMPOUT%"
if not defined SIZE set "SIZE=unknown"
if exist "%TMPOUT%" del /q "%TMPOUT%"

echo.
echo ===============================================================
echo   BUILD OK
echo ===============================================================
echo   folder : %RELEASE%
echo   files  : %FILE_COUNT%
echo   size   : %SIZE%
echo   site   : %SITE_URL%
if defined WARNED echo   NOTE   : finished with warnings - see above.
echo.
echo   Read DEPLOY.txt inside the folder before uploading.
echo.
endlocal
exit /b 0

:fail
echo.
echo ===============================================================
echo   BUILD FAILED
echo ===============================================================
echo.
endlocal
exit /b 1
