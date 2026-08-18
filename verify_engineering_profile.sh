#!/bin/bash
# SOVEREIGN — Engineering Profile and Pre-Access Audit. TERMINAL 2 ONLY. Read-only.
set -u
cd ~/Developer/sovereign-platform || { echo "FAIL: repo not found"; exit 1; }
hdr() { echo; echo "============================================================"; echo "$1"; echo "============================================================"; }
sub() { echo; echo "  -- $1 --"; }
echo; echo "SOVEREIGN — engineering profile   HEAD $(git rev-parse --short HEAD)   $(date '+%Y-%m-%d %H:%M')"

hdr "0. PRE-ACCESS AUDIT — read before inviting anyone to the repository"
sub "Is any .env or key file TRACKED right now?"
git ls-files | grep -iE "\.env|secret|credential|\.pem$|\.key$|settings\.local" | head -20
echo "     (blank = nothing of that shape is tracked)"
sub "Has any such file EVER been committed?"
git log --all --name-only --format="" 2>/dev/null | sort -u | grep -iE "\.env|secret|credential|\.pem$|\.key$|settings\.local" | head -20
echo "     (blank = never committed)"
sub "Any API-key-shaped literal in tracked files?"
git grep -InE "sk-[A-Za-z0-9_-]{16,}" 2>/dev/null | head -12
echo "     (blank = none in the working tree)"
sub "Same search across ALL history — the one that matters"
git log --all -p --no-color 2>/dev/null | grep -aoE "sk-[A-Za-z0-9_-]{20,}" | sort -u | head -6
echo "     (blank = none in history)"
sub ".gitignore coverage"
grep -nE "env|secret|key|local|log" .gitignore 2>/dev/null | head -12
sub "How the API key reaches the app"
cat module-apex/src/anthropic-key.ts 2>/dev/null | head -20
sub "Are log outputs tracked?"
git ls-files | grep -E "^sovereign-security/logs/|\.jsonl$" | head -6

hdr "1. REPOSITORY SHAPE"
sub "Workspace layout"
grep -n "workspaces" -A 20 package.json 2>/dev/null | head -24
sub "Package manager and engines"
grep -nE "packageManager|\"engines\"|\"node\"" package.json 2>/dev/null | head -8
sub "Top-level directories"
ls -1d */ 2>/dev/null | grep -v node_modules | head -25
sub "Size and history"
du -sh .git 2>/dev/null | sed 's/^/  .git: /'
git rev-list --count HEAD 2>/dev/null | sed 's/^/  commits: /'

hdr "2. LANGUAGES AND VERSIONS"
sub "Core dependency versions"
grep -nE "\"(react|typescript|vite|vitest|jest|zod)\"" package.json */package.json 2>/dev/null | grep -v node_modules | head -20
sub "Python side"
ls -1 sovereign-security/*.txt sovereign-security/*.toml sovereign-security/*.cfg 2>/dev/null
sub "Source line counts"
echo -n "  TypeScript/TSX: "; git ls-files "*.ts" "*.tsx" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}'
echo -n "  Python        : "; git ls-files "*.py" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}'
echo -n "  Markdown      : "; git ls-files "*.md" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}'

hdr "3. DEPENDENCIES"
node -e "const p=require('./package.json');console.log('  dependencies:',Object.keys(p.dependencies||{}).length,' dev:',Object.keys(p.devDependencies||{}).length)" 2>/dev/null
node -e "const p=require('./package.json');console.log('  prod: '+Object.keys(p.dependencies||{}).join(', '))" 2>/dev/null

hdr "4. HOW MODULES PLUG IN"
sed -n '1,55p' sovereign-shell/src/module-loader/index.ts 2>/dev/null
sub "Dynamic import or static registration?"
grep -rn "import(\|lazy(\|register" --include="*.ts" sovereign-shell/src/module-loader 2>/dev/null | head -10

hdr "5. WHAT THE CONTRACT ENFORCES"
sub "Exports"
grep -nE "^export (type|interface|const|function)" sovereign-shell/shell-contract.ts 2>/dev/null | head -20
sub "Any runtime guard inside the contract?"
grep -nE "throw|assert|validate|zod" sovereign-shell/shell-contract.ts 2>/dev/null | head -10
echo "     (blank = compile-time types only)"
wc -l sovereign-shell/shell-contract.ts 2>/dev/null

hdr "6. TESTING"
grep -rnE "\"(vitest|jest)\"" package.json */package.json 2>/dev/null | grep -v node_modules | head -6
echo -n "  test files: "; git ls-files "*test*" "*spec*" | grep -E "\.(ts|tsx|py)$" | wc -l | tr -d ' '
echo -n "  test lines: "; git ls-files "*test*" "*spec*" | grep -E "\.(ts|tsx|py)$" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}'
echo -n "  e2e files : "; git ls-files "e2e/*" | grep -c "test" | tr -d ' '
sub "Coverage measured?"
grep -rn "coverage" package.json vitest.config* 2>/dev/null | grep -v node_modules | head -6
echo "     (blank = no coverage configured)"
echo -n "  files using vi.mock/jest.mock: "; git grep -l "vi.mock\|jest.mock" 2>/dev/null | wc -l | tr -d ' '

hdr "7. BUILD, LINT, TYPE-CHECK"
node -e "const p=require('./package.json');Object.entries(p.scripts||{}).slice(0,25).forEach(([k,v])=>console.log('  '+k+': '+v))" 2>/dev/null
ls -1 .eslintrc* eslint.config.* tsconfig*.json .prettierrc* 2>/dev/null

hdr "8. CAN A DEVELOPER GET IT RUNNING?"
ls -1 README* 2>/dev/null || echo "  no README at repo root"
grep -nE "^#|npm |install" README.md 2>/dev/null | head -12
sub "Environment variables expected"
git grep -hoE "VITE_[A-Z_]+" 2>/dev/null | sort -u | head -20
ls -1 .env.example .env.sample 2>/dev/null || echo "  no example env file"

hdr "9. WHERE COMPLEXITY CONCENTRATES"
git ls-files "*.ts" "*.tsx" | xargs wc -l 2>/dev/null | sort -rn | sed -n '2,12p'
sub "Ports pattern"
git ls-files "*port*.ts" | head -12
echo
