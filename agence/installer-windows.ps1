# Installe tout ce qu'il faut pour l'agence d'agents Forlife sur un PC Windows 10/11.
# Usage (PowerShell, dans le dossier du dépôt FORLIFE) :
#   powershell -ExecutionPolicy Bypass -File agence\installer-windows.ps1
#   powershell -ExecutionPolicy Bypass -File agence\installer-windows.ps1 -Montage   (+ moteur de montage vidéo)
param([switch]$Montage)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

function Etape($t) { Write-Host "`n== $t" -ForegroundColor DarkYellow }
function Present($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
function Recharger-Path { $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User') }

if (-not (Present winget)) { Write-Host "winget est absent : installez « App Installer » depuis le Microsoft Store, puis relancez." -ForegroundColor Red; exit 1 }

Etape "Outils de base (Git, Node.js LTS, FFmpeg)"
$paquets = @(@{ cmd='git'; id='Git.Git' }, @{ cmd='node'; id='OpenJS.NodeJS.LTS' }, @{ cmd='ffmpeg'; id='Gyan.FFmpeg' })
foreach ($p in $paquets) {
  if (Present $p.cmd) { Write-Host "ok  $($p.cmd)" }
  else { winget install --id $p.id -e --accept-source-agreements --accept-package-agreements; Recharger-Path }
}

Etape "Dépendances du dépôt (Playwright)"
npm install

Etape "Navigateur de rendu (Chromium pour Playwright)"
npx playwright install chromium

if ($Montage) {
  Etape "Moteur de montage vidéo short-editing (~15 min, 0,5 Go)"
  node .claude/skills/short-editing/engine/setup.mjs
  Write-Host "Ensuite, dans Claude Code : /studio-setup (réglages de votre style de montage)."
}

Etape "Vérification"
node agence/verifier.mjs
Write-Host "`nVoix off FOR LIFE : elle fonctionne sous Linux. Sous Windows, utilisez WSL (wsl --install) ou une session claude.ai/code." -ForegroundColor DarkYellow
