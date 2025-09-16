#!/bin/bash
set -e

echo "🚀 Building..."

# Auto-commit changes
git add . && git commit -m "Pre-build commit

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>" || true

# Clean dist directory
rm -rf dist && mkdir -p dist/assets/{css,js,images}

# Copy & process assets
cp -r assets/images/* dist/assets/images/
npx cleancss assets/css/styles.css -o dist/assets/css/styles.min.css
cat assets/js/{user-detection,analytics,hero-animation,stage-selector,main}.js | npx terser -o dist/assets/js/bundle.min.js
npx terser assets/js/tailwind-config.js -o dist/assets/js/tailwind-config.min.js

# Copy static files
[ -f 404.html ] && cp 404.html dist/
[ -f robots.txt ] && cp robots.txt dist/
[ -f sitemap.xml ] && cp sitemap.xml dist/

# Generate HTML with proper script order
TIMESTAMP=$(date +%Y%m%d%H%M%S)
# First pass: update asset references and timestamps
sed \
    -e "s/styles\.css/styles.min.css/g" \
    -e "s/tailwind-config\.js/tailwind-config.min.js/g" \
    -e "s/?v=[0-9]*/?v=$TIMESTAMP/g" \
    index.html | \
# Second pass: remove individual JS files from head and replace main.js with bundle at end
sed \
    -e "/user-detection\.js/d" \
    -e "/analytics\.js/d" \
    -e "/hero-animation\.js/d" \
    -e "/stage-selector\.js/d" \
    -e "s/main\.js/bundle.min.js/g" > dist/index.html

# Minify the HTML
npx html-minifier dist/index.html -o dist/index.html --collapse-whitespace --remove-comments

# Smoke test
echo "🧪 Running smoke test..."
# Install puppeteer if not available
if ! node -e "require('puppeteer')" 2>/dev/null; then
    echo "Installing puppeteer..."
    npm install puppeteer --no-save
fi
node smoke-test.js
if [ $? -ne 0 ]; then
    echo "❌ Smoke test failed! Aborting deployment."
    exit 1
fi

# Deploy
git add -f dist/ && git commit -m "Build: $TIMESTAMP" && git push

echo "✅ Done! Timestamp: $TIMESTAMP"