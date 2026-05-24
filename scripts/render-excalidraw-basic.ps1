param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [string]$OutputPath = ""
)

Add-Type -AssemblyName System.Drawing

function Convert-Color {
  param([string]$Hex)
  if ([string]::IsNullOrWhiteSpace($Hex) -or $Hex -eq "transparent") {
    return [System.Drawing.Color]::Transparent
  }
  return [System.Drawing.ColorTranslator]::FromHtml($Hex)
}

function New-Pen {
  param([string]$Color, [float]$Width)
  $pen = [System.Drawing.Pen]::new((Convert-Color $Color), [Math]::Max(1, $Width))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  return $pen
}

function Draw-ArrowHead {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Pen]$Pen,
    [float]$X1,
    [float]$Y1,
    [float]$X2,
    [float]$Y2
  )
  $angle = [Math]::Atan2($Y2 - $Y1, $X2 - $X1)
  $size = 16
  $a1 = $angle + [Math]::PI * 0.82
  $a2 = $angle - [Math]::PI * 0.82
  $p1 = [System.Drawing.PointF]::new($X2, $Y2)
  $p2 = [System.Drawing.PointF]::new($X2 + [Math]::Cos($a1) * $size, $Y2 + [Math]::Sin($a1) * $size)
  $p3 = [System.Drawing.PointF]::new($X2 + [Math]::Cos($a2) * $size, $Y2 + [Math]::Sin($a2) * $size)
  $Graphics.DrawLine($Pen, $p1, $p2)
  $Graphics.DrawLine($Pen, $p1, $p3)
}

$json = Get-Content -LiteralPath $InputPath -Raw -Encoding UTF8 | ConvertFrom-Json
$elements = @($json.elements | Where-Object { -not $_.isDeleted })

$minX = 999999
$minY = 999999
$maxX = -999999
$maxY = -999999

foreach ($el in $elements) {
  $minX = [Math]::Min($minX, [double]$el.x)
  $minY = [Math]::Min($minY, [double]$el.y)
  $maxX = [Math]::Max($maxX, [double]$el.x + [double]$el.width)
  $maxY = [Math]::Max($maxY, [double]$el.y + [double]$el.height)
}

$padding = 80
$scale = 2.0
$canvasW = [int][Math]::Ceiling(($maxX - $minX + 2 * $padding) * $scale)
$canvasH = [int][Math]::Ceiling(($maxY - $minY + 2 * $padding) * $scale)

$bitmap = [System.Drawing.Bitmap]::new($canvasW, $canvasH)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$graphics.Clear([System.Drawing.Color]::White)

function SX([double]$x) { return [float](($x - $script:minX + $script:padding) * $script:scale) }
function SY([double]$y) { return [float](($y - $script:minY + $script:padding) * $script:scale) }
function SW([double]$w) { return [float]($w * $script:scale) }

foreach ($el in $elements) {
  $x = SX $el.x
  $y = SY $el.y
  $w = SW $el.width
  $h = SW $el.height
  $stroke = $el.strokeColor
  $fill = $el.backgroundColor
  $strokeWidth = [float]$el.strokeWidth

  if ($el.type -eq "rectangle") {
    $pen = New-Pen $stroke $strokeWidth
    $brush = [System.Drawing.SolidBrush]::new((Convert-Color $fill))
    $radius = 12
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $path.AddArc($x, $y, $radius, $radius, 180, 90)
    $path.AddArc($x + $w - $radius, $y, $radius, $radius, 270, 90)
    $path.AddArc($x + $w - $radius, $y + $h - $radius, $radius, $radius, 0, 90)
    $path.AddArc($x, $y + $h - $radius, $radius, $radius, 90, 90)
    $path.CloseFigure()
    $graphics.FillPath($brush, $path)
    $graphics.DrawPath($pen, $path)
    $path.Dispose()
    $brush.Dispose()
    $pen.Dispose()
  }

  if ($el.type -eq "ellipse") {
    $pen = New-Pen $stroke $strokeWidth
    $brush = [System.Drawing.SolidBrush]::new((Convert-Color $fill))
    $graphics.FillEllipse($brush, $x, $y, $w, $h)
    $graphics.DrawEllipse($pen, $x, $y, $w, $h)
    $brush.Dispose()
    $pen.Dispose()
  }

  if ($el.type -eq "line" -or $el.type -eq "arrow") {
    $pen = New-Pen $stroke $strokeWidth
    $points = @($el.points)
    for ($i = 0; $i -lt $points.Count - 1; $i++) {
      $x1 = SX ([double]$el.x + [double]$points[$i][0])
      $y1 = SY ([double]$el.y + [double]$points[$i][1])
      $x2 = SX ([double]$el.x + [double]$points[$i + 1][0])
      $y2 = SY ([double]$el.y + [double]$points[$i + 1][1])
      $graphics.DrawLine($pen, $x1, $y1, $x2, $y2)
      if ($el.type -eq "arrow" -and $i -eq $points.Count - 2 -and $el.endArrowhead -eq "arrow") {
        Draw-ArrowHead $graphics $pen $x1 $y1 $x2 $y2
      }
    }
    $pen.Dispose()
  }

  if ($el.type -eq "text") {
    $originalFontSize = [float]$el.fontSize
    $fontSize = $originalFontSize * $script:scale
    $fontStyle = [System.Drawing.FontStyle]::Regular
    if ($originalFontSize -ge 24) { $fontStyle = [System.Drawing.FontStyle]::Bold }
    $font = [System.Drawing.Font]::new("Segoe UI", $fontSize, $fontStyle, [System.Drawing.GraphicsUnit]::Pixel)
    $brush = [System.Drawing.SolidBrush]::new((Convert-Color $stroke))
    $format = [System.Drawing.StringFormat]::new()
    $format.Alignment = switch ($el.textAlign) {
      "center" { [System.Drawing.StringAlignment]::Center }
      "right" { [System.Drawing.StringAlignment]::Far }
      default { [System.Drawing.StringAlignment]::Near }
    }
    $format.LineAlignment = switch ($el.verticalAlign) {
      "middle" { [System.Drawing.StringAlignment]::Center }
      "bottom" { [System.Drawing.StringAlignment]::Far }
      default { [System.Drawing.StringAlignment]::Near }
    }
    $rect = [System.Drawing.RectangleF]::new($x, $y, [Math]::Max(10, $w), [Math]::Max(10, $h))
    $graphics.DrawString($el.text, $font, $brush, $rect, $format)
    $format.Dispose()
    $brush.Dispose()
    $font.Dispose()
  }
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = [System.IO.Path]::ChangeExtension($InputPath, ".png")
}

$bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()

Write-Output "PNG saved: $OutputPath"
