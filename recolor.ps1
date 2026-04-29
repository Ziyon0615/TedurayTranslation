$path = "c:\Users\Diony\Desktop\Neural Network Model for Machine Translation\src\app\admin\page.tsx"
$content = Get-Content $path -Raw
$content = $content -replace 'bg-indigo-600 hover:bg-indigo-700', 'btn-primary'
$content = $content -replace 'text-indigo-600', 'text-teal-600'
$content = $content -replace 'bg-indigo-100', 'bg-teal-100'
$content = $content -replace 'text-indigo-700', 'text-teal-700'
$content = $content -replace 'bg-indigo-900/50', 'bg-teal-900/50'
$content = $content -replace 'text-indigo-300', 'text-teal-300'
$content = $content -replace 'border-indigo-600', 'border-teal-600'
$content = $content -replace 'ring-indigo-500', 'ring-teal-500'
$content = $content -replace 'bg-indigo-900/30', 'bg-teal-900/30'
$content = $content -replace 'text-indigo-400', 'text-teal-400'
$content = $content -replace 'text-indigo-200', 'text-white/70'
$content = $content -replace 'bg-indigo-600', 'bg-teal-600'
$content = $content -replace 'hover:bg-indigo-700', 'hover:bg-teal-700'
Set-Content $path $content -NoNewline
