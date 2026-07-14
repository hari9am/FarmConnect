# FarmConnect Development Environment Launcher (PowerShell)
param(
    [string]$Mode = ""
)

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FarmConnect Development Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set project directories
$RootDir = $PSScriptRoot
$ClientDir = Join-Path $RootDir "client"
$MobileDir = Join-Path $RootDir "mobile"
$ServerDir = Join-Path $RootDir "server"

# Change to project root
Set-Location $RootDir

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "[INFO] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found in PATH. Please install Node.js and try again." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "[INFO] npm found: $npmVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] npm not found in PATH. Please ensure npm is installed with Node.js." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install root dependencies if missing
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing root dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install root dependencies." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[SUCCESS] Root dependencies installed." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[INFO] Root dependencies already installed." -ForegroundColor Green
    Write-Host ""
}

# Check if client directory exists
if (-not (Test-Path $ClientDir)) {
    Write-Host "[ERROR] Client directory not found: $ClientDir" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if mobile directory exists and install dependencies
if (-not (Test-Path $MobileDir)) {
    Write-Host "[WARNING] Mobile directory not found: $MobileDir" -ForegroundColor Yellow
    Write-Host "[INFO] Continuing without mobile setup..." -ForegroundColor Yellow
    Write-Host ""
} else {
    if (-not (Test-Path (Join-Path $MobileDir "node_modules"))) {
        Write-Host "[INFO] Installing mobile dependencies..." -ForegroundColor Yellow
        Push-Location $MobileDir
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to install mobile dependencies." -ForegroundColor Red
            Pop-Location
            Read-Host "Press Enter to exit"
            exit 1
        }
        Pop-Location
        Write-Host "[SUCCESS] Mobile dependencies installed." -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "[INFO] Mobile dependencies already installed." -ForegroundColor Green
        Write-Host ""
    }
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "[WARNING] .env file not found. Make sure to configure your environment variables." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "[INFO] Environment file found." -ForegroundColor Green
    Write-Host ""
}

# If mode is specified as parameter, run directly
if ($Mode -ne "") {
    switch ($Mode.ToLower()) {
        "fullstack" { 
            Write-Host "[INFO] Starting Full Stack Development..." -ForegroundColor Cyan
            npm run dev
            return
        }
        "server" { 
            Write-Host "[INFO] Starting Server Only..." -ForegroundColor Cyan
            npm run dev
            return
        }
        "client" { 
            Write-Host "[INFO] Starting Client Development Server..." -ForegroundColor Cyan
            Push-Location $ClientDir
            if (Test-Path "package.json") {
                npm run dev
            } else {
                npx vite
            }
            Pop-Location
            return
        }
        "mobile" { 
            if (Test-Path $MobileDir) {
                Write-Host "[INFO] Starting Mobile Development (Expo)..." -ForegroundColor Cyan
                Push-Location $MobileDir
                npx expo start
                Pop-Location
            } else {
                Write-Host "[ERROR] Mobile directory not found." -ForegroundColor Red
            }
            return
        }
        "build" { 
            Write-Host "[INFO] Building project..." -ForegroundColor Cyan
            npm run build
            return
        }
    }
}

# Display startup options
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Choose Development Mode:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Start Full Stack (Server + Client)" -ForegroundColor White
Write-Host "2. Start Server Only" -ForegroundColor White
Write-Host "3. Start Client Only (Vite Dev Server)" -ForegroundColor White
Write-Host "4. Start Mobile Development (Expo)" -ForegroundColor White
Write-Host "5. Build Project" -ForegroundColor White
Write-Host "6. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "[INFO] Starting Full Stack Development..." -ForegroundColor Cyan
        Write-Host "[INFO] Server will run on http://localhost:5000" -ForegroundColor Yellow
        Write-Host "[INFO] Client will be served by the Express server" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press Ctrl+C to stop the development server" -ForegroundColor Yellow
        Write-Host ""
        npm run dev
    }
    "2" {
        Write-Host ""
        Write-Host "[INFO] Starting Server Only..." -ForegroundColor Cyan
        Write-Host "[INFO] Server will run on http://localhost:5000" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        npm run dev
    }
    "3" {
        Write-Host ""
        Write-Host "[INFO] Starting Client Development Server..." -ForegroundColor Cyan
        Write-Host "[INFO] Make sure the backend server is running separately" -ForegroundColor Yellow
        Write-Host ""
        Push-Location $ClientDir
        if (Test-Path "package.json") {
            npm run dev
        } else {
            Write-Host "[ERROR] Client package.json not found. Using Vite directly..." -ForegroundColor Red
            npx vite
        }
        Pop-Location
    }
    "4" {
        if (-not (Test-Path $MobileDir)) {
            Write-Host "[ERROR] Mobile directory not found. Cannot start mobile development." -ForegroundColor Red
            Read-Host "Press Enter to continue"
        } else {
            Write-Host ""
            Write-Host "[INFO] Starting Mobile Development (Expo)..." -ForegroundColor Cyan
            Write-Host "[INFO] Make sure you have Expo CLI installed: npm install -g @expo/cli" -ForegroundColor Yellow
            Write-Host ""
            Push-Location $MobileDir
            npx expo start
            Pop-Location
        }
    }
    "5" {
        Write-Host ""
        Write-Host "[INFO] Building project..." -ForegroundColor Cyan
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Build completed successfully." -ForegroundColor Green
            Write-Host "[INFO] Built files are in the dist/ directory" -ForegroundColor Yellow
        } else {
            Write-Host "[ERROR] Build failed." -ForegroundColor Red
        }
        Read-Host "Press Enter to continue"
    }
    "6" {
        Write-Host ""
        Write-Host "[INFO] Exiting..." -ForegroundColor Yellow
    }
    default {
        Write-Host "[ERROR] Invalid choice. Please enter a number between 1-6." -ForegroundColor Red
        Read-Host "Press Enter to continue"
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Development session ended" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
