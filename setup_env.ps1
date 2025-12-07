# --- Script to clean and set up the Python virtual environment ---

# Set the path to your backend directory
$backendDir = "C:\Users\Gokova\OneDrive - CELEBI HAVACILIK HOLDING A.S\Personel\Programming\Python\backend"

# --- DO NOT EDIT BELOW THIS LINE ---

Write-Host "--- Starting Environment Setup ---"

# Change to the backend directory
try {
    Set-Location -Path $backendDir
    Write-Host "Successfully changed directory to: $backendDir"
}
catch {
    Write-Host "ERROR: Could not change directory to '$backendDir'. Please check the path and try again."
    exit
}

# Step 1: Remove the old virtual environment
Write-Host "Step 1: Removing old 'venv' directory (if it exists)..."
Remove-Item -Path "venv" -Recurse -Force -ErrorAction SilentlyContinue

# Step 2: Create a new virtual environment
Write-Host "Step 2: Creating new virtual environment ('venv')..."
try {
    python -m venv venv
    Write-Host "Successfully created 'venv'."
}
catch {
    Write-Host "ERROR: Failed to create virtual environment. Make sure Python is installed and in your PATH."
    exit
}

# Step 3: Upgrade pip
Write-Host "Step 3: Upgrading pip..."
try {
    ./venv/Scripts/python.exe -m pip install --upgrade pip
    Write-Host "pip upgraded successfully."
}
catch {
    Write-Host "ERROR: Failed to upgrade pip."
    exit
}

# Step 4: Install requirements
Write-Host "Step 4: Installing dependencies from requirements.txt..."
try {
    ./venv/Scripts/pip.exe install -r requirements.txt
    Write-Host "Successfully installed all dependencies."
}
catch {
    Write-Host "ERROR: Failed to install dependencies. Please check the output above for errors."
    exit
}

Write-Host ""
Write-Host "--- SETUP COMPLETE! ---"
Write-Host ""
Write-Host "To run the server, use the following two commands:"
Write-Host "1. Activate the environment: .\venv\Scripts\activate"
Write-Host "2. Start the server:         uvicorn main:app --reload"

Read-Host "Press Enter to exit..."