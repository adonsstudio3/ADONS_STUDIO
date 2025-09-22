# PowerShell script to transcode selected videos to 720p H.264
# Requires ffmpeg in PATH. Runs two transcodes and writes output to public/videos/converted

$srcFolder = "public/videos"
$dstFolder = "public/videos/converted"
New-Item -ItemType Directory -Force -Path $dstFolder | Out-Null

# List of files to transcode (adjust names if necessary)
$files = @("firefly-temple.mp4", "firefly-holo.mp4")

foreach ($f in $files) {
    $in = Join-Path $srcFolder $f
    if (-Not (Test-Path $in)) {
        Write-Host "Source not found: $in" -ForegroundColor Yellow
        continue
    }
    $base = [System.IO.Path]::GetFileNameWithoutExtension($f)
    $out = Join-Path $dstFolder ($base + "_720.mp4")
    Write-Host "Transcoding $in -> $out"
    ffmpeg -y -i "$in" -c:v libx264 -preset medium -crf 23 -maxrate 3M -bufsize 6M -vf "scale=-2:720" -profile:v main -c:a aac -b:a 128k "$out"
}

Write-Host "Done. Converted files are in: $dstFolder" -ForegroundColor Green
