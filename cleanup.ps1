
$ErrorActionPreference = "SilentlyContinue"
Write-Host "Starting Cleanup..."
Set-Location "C:\Users\sala7\.gemini\antigravity\playground\finume\easy-ux"

# 1. Remove Root Files
Write-Host "Removing legacy root files..."
Remove-Item "vite.config.ts", "index.html", "index.tsx", "App.tsx", "mockData.ts", "deploy.sh", "eslint.config.js", "types.ts", "tsconfig.node.json", "package.json", "package-lock.json" -Force

# 2. Remove Root Directories
Write-Host "Removing legacy directories..."
Remove-Item "frontend", "context", "components", "pages", "services", "utils", "hooks", "assets", "node_modules", "dist", "build", "src", "public" -Recurse -Force

# 3. Copy Backend Content to Root
Write-Host "Migrating backend to root..."
Copy-Item -Path "backend\*" -Destination "." -Recurse -Force
Copy-Item "backend\.env" "." -Force
Copy-Item "backend\.gitignore" "." -Force
Copy-Item "backend\.eslintrc.json" "." -Force
Copy-Item "backend\.npmrc" "." -Force

# 4. Remove Backend Folder
Write-Host "Removing backend folder..."
Remove-Item "backend" -Recurse -Force

Write-Host "Migration Complete. App is now backend-less Next.js in root."
