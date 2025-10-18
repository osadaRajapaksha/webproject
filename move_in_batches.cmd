@echo off
setlocal EnableDelayedExpansion

REM Change directory to your folder
cd /d "D:\Downloads\opensubtitles.org.dump.9180519.to.9521948.by.lang.2023.04.26\langs\sinhala_all"

set count=0
set folder=1

for %%F in (*.*) do (
    if !count! geq 1000 (
        set /a folder+=1
        set count=0
    )

    if not exist "!folder!" (
        mkdir "!folder!"
    )

    echo Moving "%%F" to folder "!folder!"...
    move "%%F" "!folder!\" >nul
    set /a count+=1
)

echo.
echo ✅ Done! Created folders up to !folder!.
pause

