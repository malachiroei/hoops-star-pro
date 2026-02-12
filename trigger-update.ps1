# Trigger first league standings update via PowerShell
$supabaseUrl = "https://gyxqczdhzsndzcqfqmgl.supabase.co"
$supabaseAnonKey = "sb_publishable_hbu5EdKJaaAO2nYREXTt-w___IQ2V8b"

Write-Host "🚀 Triggering league standings first update..." -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $supabaseAnonKey"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest `
        -Uri "$supabaseUrl/functions/v1/fetch-league-standings" `
        -Method POST `
        -Headers $headers `
        -Body '{}' `
        -ContentType "application/json"
    
    Write-Host "✅ Success! Response:" -ForegroundColor Green
    Write-Host $response.Content
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Make sure the Edge Function is deployed to Supabase first." -ForegroundColor Yellow
}
