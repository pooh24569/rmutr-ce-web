@echo off
REM 
REM   
REM 

REM 
set DB_URI=mongodb://localhost:27017/rmutr
set OUT_DIR=db_export

REM 
if not exist %OUT_DIR% mkdir %OUT_DIR%

echo.
echo 
echo   
echo 
echo.

echo [1/7] Exporting users...
mongoexport --uri=%DB_URI% --collection=users --out=%OUT_DIR%/users.json --jsonArray

echo [2/7] Exporting classes...
mongoexport --uri=%DB_URI% --collection=classes --out=%OUT_DIR%/classes.json --jsonArray

echo [3/7] Exporting enrollments...
mongoexport --uri=%DB_URI% --collection=enrollments --out=%OUT_DIR%/enrollments.json --jsonArray

echo [4/7] Exporting attendances...
mongoexport --uri=%DB_URI% --collection=attendances --out=%OUT_DIR%/attendances.json --jsonArray

echo [5/7] Exporting sessions...
mongoexport --uri=%DB_URI% --collection=sessions --out=%OUT_DIR%/sessions.json --jsonArray

echo [6/7] Exporting studentprofiles...
mongoexport --uri=%DB_URI% --collection=studentprofiles --out=%OUT_DIR%/studentprofiles.json --jsonArray

echo [7/7] Exporting events...
mongoexport --uri=%DB_URI% --collection=events --out=%OUT_DIR%/events.json --jsonArray

echo.
echo 
echo  
echo   
echo 
echo.

pause
