# Check for mysql in PATH
$mysql = Get-Command mysql -ErrorAction SilentlyContinue

if (-not $mysql) {
    # Check common XAMPP locations
    $possiblePaths = @(
        "C:\xampp\mysql\bin\mysql.exe",
        "D:\xampp\mysql\bin\mysql.exe",
        "C:\Program Files\xampp\mysql\bin\mysql.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $mysql = $path
            break
        }
    }
}

if (-not $mysql) {
    Write-Host "Error: 'mysql' command not found in PATH or common XAMPP locations." -ForegroundColor Red
    Write-Host "Please ensure XAMPP is installed and MySQL is running."
    Write-Host "You may need to add C:\xampp\mysql\bin to your system PATH."
    exit 1
}

Write-Host "Found mysql at: $mysql" -ForegroundColor Green

# Database details
$dbName = "ft_welcome"
$sqlFile = "ft_welcome.sql"

# Create database if it doesn't exist
Write-Host "Creating database '$dbName' if it doesn't exist..."
& $mysql -u root -e "CREATE DATABASE IF NOT EXISTS $dbName;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created or already exists." -ForegroundColor Green
}
else {
    Write-Host "Failed to create database. Please check if MySQL is running." -ForegroundColor Red
    exit 1
}

# Import SQL file
Write-Host "Importing '$sqlFile' into '$dbName'..."
Get-Content $sqlFile | & $mysql -u root $dbName

if ($LASTEXITCODE -eq 0) {
    Write-Host "Import completed successfully!" -ForegroundColor Green
}
else {
    Write-Host "Import failed or tables already exist (this may be OK)." -ForegroundColor Yellow
}

Write-Host "Database setup complete! All tables are included in ft_welcome.sql." -ForegroundColor Cyan
