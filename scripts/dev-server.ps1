param([int]$Port = 5173)

# 순수 정적 파일 서버 — Node/Python 없이 .NET HttpListener만 사용.
# 브라우저 프리뷰가 file://에서 JS를 실행하지 않아 앱을 확인하려면 http가 필요하다.
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

# 같은 와이파이/랜에 있는 폰에서도 접속할 수 있게 "+"(모든 호스트) 바인딩을 먼저 시도한다.
# .NET은 이 실패를 Add()가 아니라 Start() 시점에 던지므로 통째로 시도-실패 처리한다.
# 관리자 권한이 없으면 실패할 수 있는데, 그 경우 localhost 전용으로 재시작한다.
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$Port/")
$lanMode = $true
try {
    $listener.Start()
} catch {
    $lanMode = $false
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Start()
}
Write-Host "Serving $root at http://localhost:$Port/ (LAN 바인딩: $lanMode)"

$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        try {
            $req = $context.Request
            $res = $context.Response
            $res.SendChunked = $false
            $path = $req.Url.LocalPath
            if ($path -eq "/") { $path = "/index.html" }
            $relative = $path.TrimStart("/") -replace "/", [System.IO.Path]::DirectorySeparatorChar
            $filePath = Join-Path $root $relative

            if ((Test-Path $filePath -PathType Leaf)) {
                $ext = [System.IO.Path]::GetExtension($filePath)
                $ct = $mime[$ext]
                if (-not $ct) { $ct = "application/octet-stream" }
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $res.ContentType = $ct
                $res.ContentLength64 = $bytes.Length
                $res.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
                $res.StatusCode = 404
                $res.ContentLength64 = $msg.Length
                $res.OutputStream.Write($msg, 0, $msg.Length)
            }
        } catch {
            # 요청 하나가 실패해도(끊긴 연결 등) 서버 전체가 죽지 않게 한다.
            Write-Host "요청 처리 중 오류: $_"
        } finally {
            $context.Response.OutputStream.Close()
        }
    }
} finally {
    $listener.Stop()
}
