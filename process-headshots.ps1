# Converts the raw LinkedIn downloads into web-ready 4:5 portrait JPEGs.
# Re-runnable: safe to run again after replacing any source file.

Add-Type -AssemblyName System.Drawing

$src = "C:\Users\ryan5\Downloads"
$dst = "C:\Users\ryan5\redhawk-website\assets\team"
New-Item -ItemType Directory -Force -Path $dst | Out-Null

# source filename -> output slug (slug also = LinkedIn vanity path)
$map = @{
  "a9.JPG"                                                               = "ryan-barone"
  "https___www.linkedin.com_in_phoebe-towe_"                            = "phoebe-towe"
  "https___www.linkedin.com_in_jackson-katona_"                         = "jackson-katona"
  "https___www.linkedin.com_in_jake-showalter_"                         = "jake-showalter"
  "https___www.linkedin.com_in_mallory-shroder_"                        = "mallory-shroder"
  "https___www.linkedin.com_in_jackson-potter-39a792323_"               = "jackson-potter"
  "https___www.linkedin.com_in_aidan-a-schmidt_"                        = "aidan-schmidt"
  "https___www.linkedin.com_in_jake-parilla-542517368_"                 = "jake-parilla"
  "IMG_7519.jpeg"                                                       = "claire-richardson"
}

# 1000x1250 (up from 800x1000) so the 92px display circle stays sharp even at
# 2x/3x device pixel ratios; quality bumped 82 -> 94 since compression
# artifacts, not resolution, were the likely source of the "not crystal
# clear" feedback at the old settings.
$OUT_W = 1000
$OUT_H = 1250   # 4:5

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
         Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, 94)

foreach ($k in $map.Keys) {
  $inPath = Join-Path $src $k
  if (-not (Test-Path $inPath)) { Write-Host "MISSING: $k" -ForegroundColor Yellow; continue }

  $img = [System.Drawing.Image]::FromFile($inPath)

  # Honor EXIF orientation (phone photos are often rotated)
  if ($img.PropertyIdList -contains 274) {
    $o = $img.GetPropertyItem(274).Value[0]
    switch ($o) {
      3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
      6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
      8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
    }
  }

  $sw = $img.Width; $sh = $img.Height
  $targetRatio = $OUT_W / $OUT_H

  # Center-crop to 4:5.
  # Vertical bias: faces sit above center, so anchor the crop toward the top
  # third rather than dead center — avoids slicing off heads.
  if (($sw / $sh) -gt $targetRatio) {
    $cw = [int]($sh * $targetRatio); $ch = $sh
    $cx = [int](($sw - $cw) / 2);    $cy = 0
  } else {
    $cw = $sw; $ch = [int]($sw / $targetRatio)
    $cx = 0;   $cy = [int](($sh - $ch) * 0.18)
    if ($cy -lt 0) { $cy = 0 }
    if (($cy + $ch) -gt $sh) { $cy = $sh - $ch }
  }

  $bmp = New-Object System.Drawing.Bitmap $OUT_W, $OUT_H
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

  $srcRect = New-Object System.Drawing.Rectangle $cx, $cy, $cw, $ch
  $dstRect = New-Object System.Drawing.Rectangle 0, 0, $OUT_W, $OUT_H
  $g.DrawImage($img, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

  $outPath = Join-Path $dst "$($map[$k]).jpg"
  $bmp.Save($outPath, $codec, $encParams)

  $kb = [int]((Get-Item $outPath).Length / 1KB)
  "{0,-18} {1,5}x{2,-5} -> crop {3}x{4} @ {5},{6} -> {7} KB" -f `
     $map[$k], $sw, $sh, $cw, $ch, $cx, $cy, $kb

  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
}

Write-Host "`nDone. Output in $dst" -ForegroundColor Green
