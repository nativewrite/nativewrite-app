# PowerShell script to export YouTube cookies
# This uses yt-dlp to extract cookies from your browser

Write-Host "Exporting YouTube cookies from browser..." -ForegroundColor Cyan
Write-Host ""

# Check if yt-dlp is installed
$ytdlpInstalled = Get-Command yt-dlp -ErrorAction SilentlyContinue

if (-not $ytdlpInstalled) {
    Write-Host "yt-dlp is not installed. Installing..." -ForegroundColor Yellow
    pip install yt-dlp
}

# Try different browsers
$browsers = @("chrome", "firefox", "edge", "brave", "opera")

foreach ($browser in $browsers) {
    Write-Host "Trying to extract cookies from $browser..." -ForegroundColor Gray
    
    try {
        yt-dlp --cookies-from-browser $browser --cookies cookies.txt "https://youtube.com" 2>$null
        
        if (Test-Path "cookies.txt" -And (Get-Item "cookies.txt").Length -gt 0) {
            Write-Host "✅ Successfully extracted cookies from $browser!" -ForegroundColor Green
            Write-Host "Cookies saved to: cookies.txt" -ForegroundColor Green
            Write-Host ""
            Write-Host "Now upload to VPS with:" -ForegroundColor Cyan
            Write-Host "  scp cookies.txt root@46.224.84.231:/opt/nativewrite/backend/cookies.txt" -ForegroundColor Yellow
            exit 0
        }
    } catch {
        # Continue to next browser
    }
}

Write-Host "❌ Could not extract cookies automatically." -ForegroundColor Red
Write-Host ""
Write-Host "Manual method:" -ForegroundColor Cyan
Write-Host "1. Install 'Get cookies.txt LOCALLY' browser extension" -ForegroundColor White
Write-Host "2. Go to youtube.com and log in" -ForegroundColor White
Write-Host "3. Click extension → Export" -ForegroundColor White
Write-Host "4. Upload cookies.txt to VPS" -ForegroundColor White





