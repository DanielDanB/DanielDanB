' Spusti server bez viditelneho okna (pouziva ho automaticke spusteni pri zapnuti pocitace)
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = dir
sh.Run "cmd /c node server\server.js >> server\server.log 2>&1", 0, False
