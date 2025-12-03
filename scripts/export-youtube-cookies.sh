#!/bin/bash
# Script to export YouTube cookies using yt-dlp
# This extracts cookies directly from your browser

echo "Exporting YouTube cookies from browser..."
echo ""

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    echo "yt-dlp is not installed. Installing..."
    pip install yt-dlp
fi

# Try to extract cookies from different browsers
BROWSERS=("chrome" "firefox" "edge" "brave" "opera")

for browser in "${BROWSERS[@]}"; do
    echo "Trying to extract cookies from $browser..."
    if yt-dlp --cookies-from-browser "$browser" --cookies cookies.txt "https://youtube.com" 2>/dev/null; then
        if [ -f "cookies.txt" ] && [ -s "cookies.txt" ]; then
            echo "✅ Successfully extracted cookies from $browser!"
            echo "Cookies saved to: cookies.txt"
            echo ""
            echo "Now upload to VPS with:"
            echo "  scp cookies.txt root@46.224.84.231:/opt/nativewrite/backend/cookies.txt"
            exit 0
        fi
    fi
done

echo "❌ Could not extract cookies automatically."
echo ""
echo "Manual method:"
echo "1. Install 'Get cookies.txt LOCALLY' browser extension"
echo "2. Go to youtube.com and log in"
echo "3. Click extension → Export"
echo "4. Upload cookies.txt to VPS"

