# Ovladani serveru Evidence zakazek (instalace spusteni pri startu pocitace, restart, zastaveni, stav).
# Nepouzivejte primo - spousti ho Nainstalovat-autostart.cmd, Restartovat-server.cmd a Zastavit-server.cmd (pravym tlacitkem - Spustit jako spravce).
param([string]$Akce = 'stav')
$ErrorActionPreference = 'Stop'
$srv = $PSScriptRoot
$dir = Split-Path -Parent $srv
$task = 'Evidence zakazek server'
$pidFile = Join-Path $srv 'server.pid'
$portFile = Join-Path $srv 'port.txt'

$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $admin) {
  Write-Host ''
  Write-Host 'Tento soubor je potreba spustit jako SPRAVCE (pravym tlacitkem - Spustit jako spravce).' -ForegroundColor Red
  exit 1
}

# zastavi nas server: ulohu v planovaci uloh a proces, jehoz cislo si server zapsal do server\server.pid (jen kdyz je to opravdu node.exe)
function Stop-Ours {
  $t = Get-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue
  if ($t) { Stop-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue }
  Start-Sleep -Milliseconds 800
  if (Test-Path $pidFile) {
    $raw = (Get-Content $pidFile -Raw).Trim()
    $p = 0
    if ([int]::TryParse($raw, [ref]$p) -and $p -gt 0) {
      $pr = Get-Process -Id $p -ErrorAction SilentlyContinue
      if ($pr -and $pr.ProcessName -eq 'node') {
        Stop-Process -Id $p -Force
        Write-Host ('Zastaven server evidence (proces ' + $p + ').')
        Start-Sleep -Seconds 1
      }
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  }
}

# vrati spojeni, pokud na portu ulozenem v server\port.txt uz nekdo posloucha (napr. starsi kopie serveru spustena rucne)
function Get-Busy {
  if (-not (Test-Path $portFile)) { return $null }
  $port = (Get-Content $portFile -Raw).Trim()
  if (-not $port) { return $null }
  return Get-NetTCPConnection -LocalPort ([int]$port) -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
}
function Warn-Busy($c) {
  Write-Host ''
  Write-Host ('POZOR: na portu serveru uz neco bezi (proces ' + $c.OwningProcess + '). Pokud je to starsi kopie serveru evidence,') -ForegroundColor Yellow
  Write-Host 'ukoncete ji ve Sprave uloh (karta Podrobnosti, node.exe s timto cislem procesu) a pak spustte Restartovat-server.cmd.' -ForegroundColor Yellow
  Write-Host 'Dve kopie najednou nad stejnymi daty se nesmi pustit. Nic jsem proto nespustil.' -ForegroundColor Yellow
}
function Show-Port {
  $port = ''
  if (Test-Path $portFile) { $port = (Get-Content $portFile -Raw).Trim() }
  if ($port) {
    $c = Get-NetTCPConnection -LocalPort ([int]$port) -State Listen -ErrorAction SilentlyContinue
    if ($c) { Write-Host ('Server posloucha na portu ' + $port + ' (proces ' + ($c | Select-Object -First 1).OwningProcess + ').') -ForegroundColor Green }
    else { Write-Host ('Na portu ' + $port + ' zatim nic neposloucha. Pockejte par sekund a zkuste "stav" znovu; pokud to trva, podivejte se do server\server.log.') -ForegroundColor Yellow }
  } else {
    Write-Host 'Soubor server\port.txt zatim neexistuje (server jeste nenastartoval).' -ForegroundColor Yellow
  }
}

switch ($Akce) {
  'install' {
    $node = (Get-Command node -ErrorAction SilentlyContinue | Select-Object -First 1).Source
    if (-not $node) {
      Write-Host 'Neni nainstalovan Node.js - nainstalujte ho z https://nodejs.org a spustte znovu.' -ForegroundColor Red
      exit 1
    }
    Stop-Ours
    Unregister-ScheduledTask -TaskName $task -Confirm:$false -ErrorAction SilentlyContinue
    $arg = '/c ""' + $node + '" "server\server.js" >> "server\server.log" 2>&1"'
    $action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument $arg -WorkingDirectory $dir
    $trigger = New-ScheduledTaskTrigger -AtStartup
    $principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Seconds 0) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew
    Register-ScheduledTask -TaskName $task -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
    Write-Host ''
    Write-Host 'Hotovo. Server evidence se bude spoustet sam pri kazdem zapnuti pocitace (bez prihlaseni, bez okna)' -ForegroundColor Green
    Write-Host 'a kdyz spadne, za minutu se spusti znovu.'
    $busy = Get-Busy
    if ($busy) { Warn-Busy $busy; exit 0 }
    Start-ScheduledTask -TaskName $task
    Start-Sleep -Seconds 4
    Show-Port
  }
  'restart' {
    if (-not (Get-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue)) {
      Write-Host 'Automaticke spousteni neni nainstalovano. Nejdriv spustte Nainstalovat-autostart.cmd (jako spravce).' -ForegroundColor Red
      exit 1
    }
    Stop-Ours
    $busy = Get-Busy
    if ($busy) { Warn-Busy $busy; exit 1 }
    Start-ScheduledTask -TaskName $task
    Write-Host 'Server se restartuje...'
    Start-Sleep -Seconds 4
    Show-Port
  }
  'stop' {
    Stop-Ours
    Write-Host 'Server je zastaven. Znovu ho spustite Restartovat-server.cmd, nebo se spusti pri dalsim zapnuti pocitace.'
  }
  default {
    $t = Get-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue
    if ($t) { Write-Host ('Uloha "' + $task + '": ' + $t.State) } else { Write-Host 'Automaticke spousteni neni nainstalovano.' }
    Show-Port
  }
}
