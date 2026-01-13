# Ensure you are in the blog repo
cd C:\Users\jeffb\src\jeff-breece.github.io

# Activate venv from oldblog (tooling)
& '..\oldblog\.venv\Scripts\Activate.ps1'

# Variables
$PY  = '..\oldblog\.venv\Scripts\python.exe'
$MIG = '..\oldblog\scripts\archive_migration\migrate_legacy_posts.py'
$TAX = '..\oldblog\scripts\archive_migration\tag_taxonomy.yaml'

# 1. Clean legacy_source (remove prior placeholder runs)
if (Test-Path legacy_source) {
  Get-ChildItem legacy_source -File | Remove-Item -Force
} else {
  New-Item -ItemType Directory -Path legacy_source | Out-Null
}

# 2. Copy real legacy markdown from posts_md
$src = 'C:\Users\jeffb\src\oldblog\bulk_restore\posts_md'
if (-not (Test-Path $src)) {
  Write-Host "[ERROR] Source folder not found: $src"
  exit 1
}

# Copy *.md / *.markdown / *.MARKDOWN (non-recursive first; add -Recurse if nested)
Copy-Item "$src\*.md"        legacy_source -ErrorAction SilentlyContinue
Copy-Item "$src\*.markdown"  legacy_source -ErrorAction SilentlyContinue
Copy-Item "$src\*.MARKDOWN"  legacy_source -ErrorAction SilentlyContinue

# If there are subdirectories inside posts_md, do a recursive copy:
# Get-ChildItem $src -Recurse -Include *.md,*.markdown,*.MARKDOWN | Copy-Item -Destination legacy_source

# 3. Count markdown files (exclude .gitkeep)
$legacyCount = (Get-ChildItem legacy_source -File -Include *.md,*.markdown,*.MARKDOWN | Measure-Object).Count
Write-Host "[INFO] Legacy markdown files found: $legacyCount"
if ($legacyCount -eq 0) {
  Write-Host "[FATAL] No markdown files copied. Check the posts_md directory contents."
  exit 1
}

# 4. Dry-run
& $PY $MIG --source legacy_source --taxonomy $TAX --dry-run --report-dir legacy_reports --heuristic-titles --verbose

Write-Host "`n[INFO] Inspect reports (legacy_reports\summary.json, tag_stats.json, posts_inventory.json). Press Enter to proceed with APPLY or Ctrl+C to abort."
Read-Host

# 5. Apply metadata (normalize front matter)
& $PY $MIG --source legacy_source --taxonomy $TAX --apply-metadata --report-dir legacy_reports --heuristic-titles --verbose

# 6. Copy normalized legacy posts into _posts (skip existing names)
$copied = 0
Get-ChildItem legacy_source -File -Include *.md,*.markdown,*.MARKDOWN | ForEach-Object {
  $dest = Join-Path _posts $_.Name
  if (-not (Test-Path $dest)) {
    Copy-Item $_.FullName $dest
    $copied++
  } else {
    Write-Host "[SKIP] Filename already exists (modern or prior import): $($_.Name)"
  }
}
Write-Host "[INFO] Copied $copied legacy posts."

# 7. Commit
git add legacy_source legacy_reports _posts
git commit -m "Import legacy archive posts from posts_md ($copied added)"

# 8. Serve locally
bundle exec jekyll serve --livereload