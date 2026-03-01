# Check for php in PATH
$php = Get-Command php -ErrorAction SilentlyContinue

if (-not $php) {
    # Check common XAMPP locations
    $possiblePaths = @(
        "C:\xampp\php\php.exe",
        "D:\xampp\php\php.exe",
        "C:\Program Files\xampp\php\php.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $php = $path
            break
        }
    }
}

if (-not $php) {
    Write-Host "Error: 'php' command not found." -ForegroundColor Red
    exit 1
}

Write-Host "Starting PHP server at http://localhost:8080 using $php" -ForegroundColor Green
& $php -S localhost:8080 -t .
