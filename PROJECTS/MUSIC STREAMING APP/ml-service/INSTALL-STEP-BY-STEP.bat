@echo off
echo ========================================
echo ML Service - Step by Step Installation
echo ========================================
echo.

echo Step 1: Core API Framework
echo ----------------------------
echo Skipping fastapi (already installed)
echo Skipping uvicorn (already installed)
echo Skipping pydantic (using newer version already installed)
echo SUCCESS: API Framework already installed
echo.

echo Step 2: Utilities
echo ----------------------------
echo Skipping python-dotenv (already installed)
pip install loguru==0.7.2
if errorlevel 1 goto error
pip install requests==2.31.0
if errorlevel 1 goto error
pip install python-multipart==0.0.6
if errorlevel 1 goto error
pip install httpx==0.26.0
if errorlevel 1 goto error
echo SUCCESS: Utilities installed
echo.

echo Step 3: Core Data Science
echo ----------------------------
echo Skipping numpy (newer version 2.3.3 already installed)
pip install scipy
if errorlevel 1 goto error
pip install pandas
if errorlevel 1 goto error
echo SUCCESS: Core data science installed
echo.

echo Step 4: Machine Learning
echo ----------------------------
pip install scikit-learn==1.3.2
if errorlevel 1 goto error
echo SUCCESS: Scikit-learn installed
echo.

echo Step 5: Audio Processing
echo ----------------------------
pip install soundfile==0.12.1
if errorlevel 1 goto error
pip install pydub==0.25.1
if errorlevel 1 goto error
pip install librosa==0.10.1
if errorlevel 1 goto error
echo SUCCESS: Audio processing installed
echo.

echo Step 6: NLP
echo ----------------------------
pip install textblob==0.17.1
if errorlevel 1 goto error
pip install langdetect==1.0.9
if errorlevel 1 goto error
echo SUCCESS: NLP installed
echo.

echo Step 7: Database
echo ----------------------------
pip install pymongo==4.6.1
if errorlevel 1 goto error
pip install motor==3.3.2
if errorlevel 1 goto error
echo SUCCESS: Database installed
echo.

echo.
echo ========================================
echo ALL PACKAGES INSTALLED SUCCESSFULLY!
echo ========================================
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo ERROR: Installation failed!
echo ========================================
echo.
pause
exit /b 1
# Already installed ✓
# fastapi, uvicorn, pydantic, python-dotenv, loguru, requests, python-multipart, httpx
# numpy, scipy, pandas

# Machine Learning (use latest versions with pre-built wheels)
pip install scikit-learn

# Recommendation packages
pip install implicit
pip install scikit-surprise  

# Audio Processing
pip install soundfile
pip install pydub
pip install audioread
pip install librosa

# NLP
pip install textblob
pip install langdetect
pip install nltk
pip install spacy
python -m spacy download en_core_web_sm

# Database
pip install pymongo
pip install motor
pip install redis

# Monitoring
pip install prometheus-client

# Additional utilities
pip install aiofiles
pip install pyyaml
pip install joblib
pip install tqdm
