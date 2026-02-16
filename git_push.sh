#!/bin/bash

# 1. Add all changes (including the new .gitignore fixes)
echo "📦 Staging changes..."
git add .

# 2. Commit changes if there are any
if ! git diff-index --quiet HEAD; then
    echo "💾 Committing changes..."
    git commit -m "feat: Updates, fixes, and configuration"
else
    echo "✨ No changes to commit."
fi

# 3. Handle GitHub Repository
# Check if a remote named 'origin' already exists
if ! git remote | grep -q origin; then
    echo "🏗️ Creating private GitHub repository..."
    # Create a private repository from the current directory
    # --source=. : use current directory
    # --remote=origin : add remote as 'origin'
    # --push : push changes immediately
    gh repo create client-happiness-dashboard --private --source=. --remote=origin --push
else
    echo "🔗 Remote 'origin' already exists."
    echo "🚀 Pushing to GitHub..."
    git push -u origin main
fi
