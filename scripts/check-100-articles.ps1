# 检查100篇文章的创建情况
$tasks = @(
    "01-经典力学-任务清单",
    "02-热力学和统计物理-任务清单", 
    "03-电磁学-任务清单",
    "04-光学-任务清单",
    "05-现代物理-任务清单",
    "06-日常物理现象-任务清单"
)

$results = @{}
$totalExpected = 0
$totalFound = 0
$missing = @()

foreach ($task in $tasks) {
    $taskFile = "docs/任务清单/$task.md"
    if (-not (Test-Path $taskFile)) {
        Write-Host "任务文件不存在: $taskFile" -ForegroundColor Red
        continue
    }
    
    $content = Get-Content $taskFile -Raw -Encoding UTF8
    $slugs = @()
    
    # 提取slug
    $slugMatches = [regex]::Matches($content, '\|\s+\d+\s+\|.*?\|\s+([a-z0-9-]+)\s+\|')
    foreach ($match in $slugMatches) {
        $slug = $match.Groups[1].Value.Trim()
        if ($slug -and $slug -ne "slug" -and $slug -match '^[a-z0-9-]+$') {
            $slugs += $slug
        }
    }
    
    # 提取文件路径（从表格中提取子分类和slug）
    $filePaths = @()
    $lines = Get-Content $taskFile -Encoding UTF8
    $currentSubcategory = ""
    
    foreach ($line in $lines) {
        # 检测子分类标题（例如：### 1.1 运动学（Kinematics）- 5个选题）
        if ($line -match '###\s+\d+\.\d+\s+.*?\(([a-z-]+)\)') {
            $currentSubcategory = $match.Groups[1].Value
        }
        
        # 检测表格行中的slug
        if ($line -match '\|\s+\d+\s+\|.*?\|\s+([a-z0-9-]+)\s+\|\s+([a-z-]+)\s+\|') {
            $slug = $match.Groups[1].Value.Trim()
            $subcategory = $match.Groups[2].Value.Trim()
            
            # 确定分类（从文件名或内容中提取）
            $category = ""
            if ($task -match "经典力学") { $category = "classical-mechanics" }
            elseif ($task -match "热力学") { $category = "thermodynamics-statistical-physics" }
            elseif ($task -match "电磁学") { $category = "electromagnetism" }
            elseif ($task -match "光学") { $category = "optics" }
            elseif ($task -match "现代物理") { $category = "modern-physics" }
            elseif ($task -match "日常物理") { $category = "everyday-physics" }
            
            if ($category -and $subcategory -and $slug) {
                $filePath = "content/topics/$category/$subcategory/$slug.md"
                $filePaths += $filePath
            }
        }
    }
    
    $found = 0
    $taskMissing = @()
    
    foreach ($filePath in $filePaths) {
        $fullPath = $filePath
        if (-not (Test-Path $fullPath)) {
            $taskMissing += $filePath
        } else {
            $found++
        }
    }
    
    $totalExpected += $slugs.Count
    $totalFound += $found
    $missing += $taskMissing
    
    $results[$task] = @{
        Expected = $slugs.Count
        Found = $found
        Missing = $taskMissing
        Slugs = $slugs
    }
}

Write-Host "`n=== 100篇文章创建情况检查报告 ===" -ForegroundColor Cyan
Write-Host "总预期文章数: $totalExpected" -ForegroundColor Yellow
Write-Host "已创建文章数: $totalFound" -ForegroundColor Yellow
Write-Host "缺失文章数: $($totalExpected - $totalFound)" -ForegroundColor $(if ($totalExpected -eq $totalFound) { "Green" } else { "Red" })

Write-Host "`n各分类详情:" -ForegroundColor Cyan
foreach ($task in $tasks) {
    $result = $results[$task]
    $status = if ($result.Found -eq $result.Expected) { "[OK]" } else { "[MISSING]" }
    Write-Host "$status $task : $($result.Found)/$($result.Expected)" -ForegroundColor $(if ($result.Found -eq $result.Expected) { "Green" } else { "Red" })
    if ($result.Missing.Count -gt 0) {
        Write-Host "  缺失文件:" -ForegroundColor Red
        foreach ($file in $result.Missing) {
            Write-Host "    - $file" -ForegroundColor Red
        }
    }
}

if ($missing.Count -gt 0) {
    Write-Host "`n所有缺失文件列表:" -ForegroundColor Red
    foreach ($file in $missing) {
        Write-Host "  - $file" -ForegroundColor Red
    }
} else {
    Write-Host "`n[SUCCESS] 所有文章都已创建！" -ForegroundColor Green
}

