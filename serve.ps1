param([int]$Port = 8765)

# Servidor estatico minimo (TcpListener) para previsualizar el sitio.
# No requiere permisos de admin (sockets crudos en loopback).
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "Sirviendo $root en http://localhost:$Port/"

$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8';
  '.js'='application/javascript; charset=utf-8'; '.json'='application/json';
  '.woff2'='font/woff2'; '.woff'='font/woff'; '.png'='image/png';
  '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp';
  '.svg'='image/svg+xml'; '.ico'='image/x-icon'
}

while ($true) {
  try {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $requestLine = $reader.ReadLine()
    if (-not $requestLine) { $client.Close(); continue }
    while (($line = $reader.ReadLine()) -ne "" -and $line -ne $null) { }

    $parts = $requestLine -split ' '
    $path = $parts[1]
    if ($path -eq '/') { $path = '/index.html' }
    $path = [System.Uri]::UnescapeDataString(($path -split '\?')[0])
    $rel = $path.TrimStart('/') -replace '/','\'
    $file = Join-Path $root $rel

    if ((Test-Path -LiteralPath $file -PathType Leaf)) {
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $ct = $mime[$ext]; if (-not $ct) { $ct = 'application/octet-stream' }
      $header = "HTTP/1.1 200 OK`r`nContent-Type: $ct`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
      $hb = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($hb,0,$hb.Length); $stream.Write($bytes,0,$bytes.Length)
    } else {
      $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rel")
      $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      $hb = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($hb,0,$hb.Length); $stream.Write($body,0,$body.Length)
    }
    $stream.Flush(); $client.Close()
  } catch {
    try { if ($client) { $client.Close() } } catch {}
  }
}
