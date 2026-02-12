Write-Host "Setting up EduTeX Python Backend..."

# Check Python
$pythonVersion = python --version
if ($LASTEXITCODE -ne 0) {
    Write-Error "Python is not found. Please install Python."
    exit 1
}
Write-Host "Found $pythonVersion"

# Install Requirements
Write-Host "Installing dependencies..."
pip install -r requirements.txt

# Run Server
Write-Host "Starting API Server on http://localhost:8000..."
$env:PYTHONPATH = "$PWD"
python api/main.py
