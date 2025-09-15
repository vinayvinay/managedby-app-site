#!/bin/bash

# Deploy script for GitHub Pages production deployment
# This script prepares production-ready code on the 'live' branch

set -e  # Exit on any error

echo "🚀 Starting deployment to live branch..."

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

# Commit current changes on master if there are any
echo "📝 Checking for uncommitted changes on master..."
if ! git diff-index --quiet HEAD --; then
    echo "💾 Committing current changes on master..."
    git add .
    git commit -m "Development changes before deployment

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
else
    echo "✅ No uncommitted changes found."
fi

# Get current commit hash for reference
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "📍 Current master commit: $CURRENT_COMMIT"

# Create or switch to live branch
echo "🌿 Switching to live branch..."
if git show-ref --verify --quiet refs/heads/live; then
    git checkout live
    echo "✅ Switched to existing live branch"
    
    # Get list of commits to cherry-pick (everything since live branch diverged from master)
    echo "🍒 Finding commits to cherry-pick from master..."
    LAST_LIVE_COMMIT=$(git merge-base live master)
    COMMITS_TO_PICK=$(git rev-list --reverse $LAST_LIVE_COMMIT..master)
    
    if [ -n "$COMMITS_TO_PICK" ]; then
        echo "📝 Cherry-picking commits from master..."
        for commit in $COMMITS_TO_PICK; do
            echo "   🍒 Cherry-picking: $(git log --oneline -1 $commit)"
            git cherry-pick $commit
        done
    else
        echo "✅ Live branch is already up to date with master"
    fi
else
    # Create new live branch from master
    git checkout -b live master
    echo "✅ Created new live branch from master"
fi

# Create production-ready files with cache busting
echo "⚡ Creating production-ready files..."

# Generate timestamp for cache busting
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# Minify CSS using clean-css
echo "🎨 Minifying CSS..."
if command_exists "cleancss"; then
    cleancss -o assets/css/styles.min.css assets/css/styles.css
elif command_exists "npx"; then
    if npx cleancss --version >/dev/null 2>&1; then
        npx cleancss -o assets/css/styles.min.css assets/css/styles.css
    else
        echo "⚠️  Warning: No CSS minifier found, copying original file"
        cp assets/css/styles.css assets/css/styles.min.css
    fi
else
    echo "⚠️  Warning: No CSS minifier found, copying original file"
    cp assets/css/styles.css assets/css/styles.min.css
fi

# Minify JavaScript using terser
echo "📜 Minifying JavaScript..."
if command_exists "terser"; then
    terser assets/js/main.js -o assets/js/main.min.js -c -m
elif command_exists "npx"; then
    if npx terser --version >/dev/null 2>&1; then
        npx terser assets/js/main.js -o assets/js/main.min.js -c -m
    else
        echo "⚠️  Warning: No JS minifier found, copying original file"
        cp assets/js/main.js assets/js/main.min.js
    fi
else
    echo "⚠️  Warning: No JS minifier found, copying original file"
    cp assets/js/main.js assets/js/main.min.js
fi

# Update index.html with cache-busted URLs and minified files
echo "🔄 Updating index.html with production settings..."
sed -i.bak \
    -e "s/styles\.css?v=[^\"']*/styles.min.css?v=$TIMESTAMP/g" \
    -e "s/main\.js?v=[^\"']*/main.min.js?v=$TIMESTAMP/g" \
    -e "s/favicon\.png?v=[^\"']*/favicon.png?v=$TIMESTAMP/g" \
    index.html

# Remove backup file
rm -f index.html.bak

# Add production files to git
echo "📦 Adding production files to git..."
git add assets/css/styles.min.css assets/js/main.min.js index.html

# Commit production changes
echo "💾 Committing production-ready code..."
git commit -m "Production deployment - minified assets with cache busting

- Minified CSS and JavaScript files
- Updated asset URLs with cache busting timestamp: $TIMESTAMP  
- Based on master commit: $CURRENT_COMMIT

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
echo "🚀 Pushing live branch to remote..."
if git remote | grep -q origin; then
    git push -u origin live
    echo "✅ Successfully pushed to origin/live"
else
    echo "⚠️  No remote 'origin' found. Please add a remote and push manually:"
    echo "   git remote add origin <your-repo-url>"
    echo "   git push -u origin live"
fi

# Switch back to master
echo "🔄 Switching back to master..."
git checkout master

echo ""
echo "🎉 Deployment complete!"
echo "📋 Summary:"
echo "   • Master branch: committed current changes"
echo "   • Live branch: cherry-picked changes and created production-ready code"
echo "   • Cache busting timestamp: $TIMESTAMP"
echo "   • Minified files: styles.min.css, main.min.js"
echo ""
echo "🔧 Next steps:"
echo "   • Configure GitHub Pages to serve from 'live' branch"
echo "   • Your production site will be available at your GitHub Pages URL"
echo ""