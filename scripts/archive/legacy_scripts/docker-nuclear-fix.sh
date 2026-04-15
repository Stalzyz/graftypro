# 0. Check and Start Docker Daemon if on Mac
if ! docker info > /dev/null 2>&1; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "⏳ Docker is not responding. Initiating TOTAL EXTERMINATION for Mac..."
        
        # Force kill ALL Docker-related processes
        sudo pkill -9 -f Docker 2>/dev/null || true
        sudo pkill -9 -f com.docker 2>/dev/null || true
        
        # Deep clean sockets
        echo "🧹 Clearing stale sockets..."
        rm -rf ~/.docker/run/*.sock 2>/dev/null || true
        rm -rf ~/Library/Containers/com.docker.docker/Data/*.sock 2>/dev/null || true
        sudo rm -f /var/run/docker.sock 2>/dev/null || true
        
        echo "🚀 Starting Docker Desktop (Fresh Instance)..."
        open -a "Docker Desktop"
        
        # Wait for docker to be ready
        MAX_RETRIES=60
        RETRY_COUNT=0
        while ! docker info > /dev/null 2>&1; do
            if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
                echo "❌ CRITICAL: Docker Engine failed to heart-beat."
                echo "👉 Please manually open the Docker app and check for error popups."
                exit 1
            fi
            echo "Waiting for Docker Engine... ($((MAX_RETRIES - RETRY_COUNT)) attempts left)"
            sleep 2
            RETRY_COUNT=$((RETRY_COUNT + 1))
        done
        
        echo "✅ Docker daemon is now ACTIVE."
        
        # --- SEQUOIA PERMISSION FIX ---
        echo "🔧 Fixing permissions for Sequoia..."
        sudo chown $USER:staff /Users/$USER/.docker/run/docker.sock 2>/dev/null || true
        sudo chmod 666 /Users/$USER/.docker/run/docker.sock 2>/dev/null || true
        sudo ln -sf /Users/$USER/.docker/run/docker.sock /var/run/docker.sock 2>/dev/null || true
        
        echo "⏳ Stabilizing (5s)..."
        sleep 5
    fi
fi

echo "☢️ STARTING DOCKER NUCLEAR CLEANUP..."

# 1. Stop and Remove specific containers that are known to conflict
echo "🛑 Stopping and Removing conflicting containers..."
docker rm -f grafty_redis grafty_postgres grafty_web grafty_worker 2>/dev/null || true

# 2. Cleanup Docker system broadly
echo "🧹 Pruning Docker system (orphans/unused networks)..."
docker-compose down --remove-orphans 2>/dev/null || true
docker network prune -f 2>/dev/null || true

# 3. Kill processes on critical ports to prevent "Address already in use"
echo "🔫 Killing processes on ports 5432 and 6379/6380..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac
    sudo lsof -ti:5432 | xargs sudo kill -9 2>/dev/null || true
    sudo lsof -ti:6379 | xargs sudo kill -9 2>/dev/null || true
    sudo lsof -ti:6380 | xargs sudo kill -9 2>/dev/null || true
else
    # Linux
    sudo fuser -k 5432/tcp 2>/dev/null || true
    sudo fuser -k 6379/tcp 2>/dev/null || true
    sudo fuser -k 6380/tcp 2>/dev/null || true
fi

echo "✅ Docker environment is now CLEAN."
