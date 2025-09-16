#!/bin/bash

# Deploy script for GitHub Pages production deployment
# Creates production-ready code in the build/ directory

set -e  # Exit on any error

echo "🚀 Starting build process..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if required tools are available
if ! command_exists "git"; then
    echo "❌ Error: git is required but not installed."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository."
    exit 1
fi

# Commit current changes if there are any
echo "📝 Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD --; then
    echo "💾 Committing current changes..."
    git add .
    git commit -m "Development changes before build

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
else
    echo "✅ No uncommitted changes found."
fi

# Get current commit hash for reference
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "📍 Current commit: $CURRENT_COMMIT"

# Create/clean build directory
echo "📁 Setting up build directory..."
rm -rf build/
mkdir -p build/assets/css build/assets/js build/assets/images

# Generate timestamp for cache busting
TIMESTAMP=$(date +%Y%m%d%H%M%S)
echo "⏰ Cache busting timestamp: $TIMESTAMP"

# Copy images (no processing needed)
echo "📋 Copying images..."
cp -r assets/images/* build/assets/images/

# Minify CSS
echo "🎨 Minifying CSS..."
if command_exists "cleancss"; then
    cleancss -o build/assets/css/styles.min.css assets/css/styles.css
elif command_exists "npx"; then
    if npx cleancss --version >/dev/null 2>&1; then
        npx cleancss -o build/assets/css/styles.min.css assets/css/styles.css
    else
        echo "⚠️  Warning: No CSS minifier found, copying original file"
        cp assets/css/styles.css build/assets/css/styles.min.css
    fi
else
    echo "⚠️  Warning: No CSS minifier found, copying original file"
    cp assets/css/styles.css build/assets/css/styles.min.css
fi

# Minify individual JavaScript files
echo "📜 Minifying JavaScript files..."

# Minify main.js
echo "  → Minifying main.js..."
if command_exists "terser"; then
    terser assets/js/main.js -o build/assets/js/main.min.js -c -m
elif command_exists "npx"; then
    if npx terser --version >/dev/null 2>&1; then
        npx terser assets/js/main.js -o build/assets/js/main.min.js -c -m
    else
        echo "⚠️  Warning: No JS minifier found, copying original file"
        cp assets/js/main.js build/assets/js/main.min.js
    fi
else
    echo "⚠️  Warning: No JS minifier found, copying original file"
    cp assets/js/main.js build/assets/js/main.min.js
fi

# Minify other JS files that are referenced in HTML
for jsfile in tailwind-config user-detection analytics hero-animation stage-selector; do
    echo "  → Minifying ${jsfile}.js..."
    if command_exists "terser"; then
        terser assets/js/${jsfile}.js -o build/assets/js/${jsfile}.min.js -c -m
    elif command_exists "npx"; then
        if npx terser --version >/dev/null 2>&1; then
            npx terser assets/js/${jsfile}.js -o build/assets/js/${jsfile}.min.js -c -m
        else
            echo "⚠️  Warning: No JS minifier found, copying original file"
            cp assets/js/${jsfile}.js build/assets/js/${jsfile}.min.js
        fi
    else
        echo "⚠️  Warning: No JS minifier found, copying original file"
        cp assets/js/${jsfile}.js build/assets/js/${jsfile}.min.js
    fi
done

# Create production index.html with updated asset references
echo "🔄 Creating production index.html..."
sed \
    -e "s/styles\.css?v=[^\"']*/styles.min.css?v=$TIMESTAMP/g" \
    -e "s/main\.js?v=[^\"']*/main.min.js?v=$TIMESTAMP/g" \
    -e "s/tailwind-config\.js?v=[^\"']*/tailwind-config.min.js?v=$TIMESTAMP/g" \
    -e "s/user-detection\.js?v=[^\"']*/user-detection.min.js?v=$TIMESTAMP/g" \
    -e "s/analytics\.js?v=[^\"']*/analytics.min.js?v=$TIMESTAMP/g" \
    -e "s/hero-animation\.js?v=[^\"']*/hero-animation.min.js?v=$TIMESTAMP/g" \
    -e "s/stage-selector\.js?v=[^\"']*/stage-selector.min.js?v=$TIMESTAMP/g" \
    -e "s/?v=[0-9]\{8,\}/?v=$TIMESTAMP/g" \
    index.html > build/index.html

# Minify HTML
echo "📄 Minifying HTML..."
if command_exists "npx"; then
    if npx html-minifier --version >/dev/null 2>&1; then
        npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true build/index.html -o build/index.html
    else
        echo "⚠️  Warning: No HTML minifier found, keeping original file"
    fi
else
    echo "⚠️  Warning: No HTML minifier found, keeping original file"
fi

# Add build directory to git (if not already ignored)
echo "📦 Adding build directory to git..."
if [ ! -f .gitignore ] || ! grep -q "^build/$" .gitignore; then
    echo "build/" >> .gitignore
    echo "✅ Added build/ to .gitignore"
else
    echo "✅ build/ already in .gitignore"
fi

# Force add build directory (override .gitignore for deployment)
git add -f build/

# Commit build
echo "💾 Committing production build..."
git commit -m "Production build - minified assets with cache busting

- Minified CSS, JavaScript, and HTML files in build/ directory
- Updated asset URLs with cache busting timestamp: $TIMESTAMP  
- Based on commit: $CURRENT_COMMIT

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
echo "🚀 Pushing to remote..."
if git remote | grep -q origin; then
    git push origin master
    echo "✅ Successfully pushed to origin/master"
else
    echo "⚠️  No remote 'origin' found. Please add a remote and push manually:"
    echo "   git remote add origin <your-repo-url>"
    echo "   git push origin master"
fi

echo ""
echo "🎉 Build complete!"
echo "📋 Summary:"
echo "   • Production files created in build/ directory"
echo "   • Cache busting timestamp: $TIMESTAMP"
echo "   • Minified CSS: styles.min.css"
echo "   • Minified JS: main.min.js, tailwind-config.min.js, user-detection.min.js, analytics.min.js, hero-animation.min.js, stage-selector.min.js"
echo "   • Production HTML: build/index.html"
echo ""
echo "🔧 Next steps:"
echo "   • Configure GitHub Pages to serve from /build directory"
echo "   • Your production site will be available at your GitHub Pages URL"
echo ""