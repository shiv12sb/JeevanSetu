Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\shivb\OneDrive\Desktop\JeevanSetu\WhatsApp Image 2026-08-22 at 1.01.37 PM.jpeg"
$resDir = "C:\Users\shivb\OneDrive\Desktop\JeevanSetu\frontend\android\app\src\main\res"

function Save-Resized-Png($srcImg, $outPath, $w, $h) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::White)
    $g.DrawImage($srcImg, 0, 0, $w, $h)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created: $outPath (${w}x${h})"
}

$src = [System.Drawing.Image]::FromFile($sourcePath)

$densities = [ordered]@{
    'mipmap-mdpi' = 48
    'mipmap-hdpi' = 72
    'mipmap-xhdpi' = 96
    'mipmap-xxhdpi' = 144
    'mipmap-xxxhdpi' = 192
}

$fgDensities = [ordered]@{
    'mipmap-mdpi' = 108
    'mipmap-hdpi' = 162
    'mipmap-xhdpi' = 216
    'mipmap-xxhdpi' = 324
    'mipmap-xxxhdpi' = 432
}

foreach ($d in $densities.Keys) {
    $size = $densities[$d]
    Save-Resized-Png $src "$resDir\$d\ic_launcher.png" $size $size
    Save-Resized-Png $src "$resDir\$d\ic_launcher_round.png" $size $size
}

foreach ($d in $fgDensities.Keys) {
    $fgSize = $fgDensities[$d]
    Save-Resized-Png $src "$resDir\$d\ic_launcher_foreground.png" $fgSize $fgSize
}

# Update splash screen images
Save-Resized-Png $src "$resDir\drawable\splash.png" 512 512

# Also update web public logos
Save-Resized-Png $src "C:\Users\shivb\OneDrive\Desktop\JeevanSetu\frontend\public\logo.png" 512 512
Save-Resized-Png $src "C:\Users\shivb\OneDrive\Desktop\JeevanSetu\frontend\app\icon.png" 192 192
Save-Resized-Png $src "C:\Users\shivb\OneDrive\Desktop\JeevanSetu\frontend\app\apple-icon.png" 180 180

$src.Dispose()
Write-Host "SUCCESS: All Android icons and logos updated with high-resolution JeevanSetu profile image!"
