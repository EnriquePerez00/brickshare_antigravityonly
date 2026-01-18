#!/bin/bash

# Configuration
INTERVAL=30 # Check every 30 seconds
REPO_DIR="/Users/I764690/Brickshare"

cd "$REPO_DIR" || exit

echo "Starting Git auto-sync in $REPO_DIR (Interval: ${INTERVAL}s)..."

while true; do
    # Check if there are any changes (including untracked files)
    if [[ -n $(git status -s) ]]; then
        echo "$(date): Changes detected. Syncing..."
        
        git add .
        git commit -m "Auto-sync: $(date +'%Y-%m-%d %H:%M:%S')"
        
        # Try to push, handle potential errors (like no internet)
        if git push origin main; then
            echo "$(date): Sync successful."
        else
            echo "$(date): Error during git push. Will retry next interval."
        fi
    fi
    
    sleep $INTERVAL
done
