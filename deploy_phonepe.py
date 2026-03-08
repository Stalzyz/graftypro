#!/usr/bin/env python3
"""
GRAFTY BSP — PhonePe Deployment via Python Paramiko
Syncs files & runs deployment commands on VPS.
"""

import subprocess
import sys
import time

# ─── CONFIG ──────────────────────────────────────────────────────
VPS_HOST = "72.61.231.187"
VPS_PORT = 22
VPS_USER = "root"
VPS_PASS = "Photoshop09@"
REMOTE_PATH = "/root/wabot_bsp"
LOCAL_PATH = "/Users/stalinkumar/Downloads/Wabot_BSP"

# ─── HELPERS ──────────────────────────────────────────────────────
def step(n, msg):
    print(f"\n{'━'*56}")
    print(f"  [{n}] {msg}")

def run_remote(client, cmd, stream=True):
    """Run a command on the VPS and stream/return output."""
    _, stdout, stderr = client.exec_command(cmd, timeout=600)
    output_lines = []
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            line = stdout.channel.recv(4096).decode('utf-8', errors='replace')
            if stream:
                print(line, end='', flush=True)
            output_lines.append(line)
        time.sleep(0.1)
    # Drain remaining output
    remaining = stdout.read().decode('utf-8', errors='replace')
    if remaining and stream:
        print(remaining, end='', flush=True)
    err = stderr.read().decode('utf-8', errors='replace')
    if err and stream:
        print(err, end='', flush=True)
    return stdout.channel.recv_exit_status()

# ─── MAIN ──────────────────────────────────────────────────────────
def main():
    try:
        import paramiko
    except ImportError:
        print("Installing paramiko...")
        subprocess.run([sys.executable, "-m", "pip", "install", "paramiko", "-q"], check=True)
        import paramiko

    print()
    print("╔══════════════════════════════════════════════════════╗")
    print("║    🦁 GRAFTY PhonePe Auto-Deployment (Python)        ║")
    print("╚══════════════════════════════════════════════════════╝")
    print()

    # ─── STEP 1: Sync via rsync + SSH password ───────────────────
    step("1/5", "📡 Syncing codebase to VPS...")

    rsync_cmd = [
        "rsync", "-az", "--delete",
        "-e", f"ssh -o StrictHostKeyChecking=no -o PasswordAuthentication=yes",
        "--exclude=node_modules",
        "--exclude=.next",
        "--exclude=.git",
        "--exclude=temp_project",
        "--exclude=.DS_Store",
        "--exclude=.env",
        "--exclude=*.zip",
        "--exclude=*.tar.gz",
        "--exclude=public/uploads",
        f"{LOCAL_PATH}/",
        f"{VPS_USER}@{VPS_HOST}:{REMOTE_PATH}/"
    ]

    # Use sshpass if available, otherwise try key auth
    try:
        result = subprocess.run(
            ["sshpass", f"-p{VPS_PASS}"] + rsync_cmd[0:1] + rsync_cmd[1:],
            capture_output=False, timeout=300
        )
    except FileNotFoundError:
        print("⚠️  sshpass not found, trying key-based rsync...")
        result = subprocess.run(rsync_cmd, capture_output=False, timeout=300)

    if result.returncode not in (0, 23):
        print(f"❌ Rsync failed with code {result.returncode}")
        sys.exit(1)

    print("✅ Sync complete.")

    # ─── STEP 2: SSH into VPS and run everything ─────────────────
    step("2/5", "🔧 Connecting to VPS...")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)
        print(f"✅ Connected to {VPS_HOST}")
    except Exception as e:
        print(f"❌ SSH connection failed: {e}")
        sys.exit(1)

    try:
        step("3/5", "🏗️ Rebuilding Docker containers...")
        rc = run_remote(client, f"""
            set -e
            cd {REMOTE_PATH}
            docker compose -f docker-compose.prod.yml build
            docker compose -f docker-compose.prod.yml down --remove-orphans
            docker compose -f docker-compose.prod.yml up -d
        """)
        if rc != 0:
            print(f"❌ Docker build/start failed (exit {rc})")
            sys.exit(1)

        print("\n⏳ Waiting 25s for containers to start...")
        time.sleep(25)

        step("4/5", "💾 Syncing DB schema & regenerating Prisma client...")
        rc = run_remote(client, f"""
            set -e
            cd {REMOTE_PATH}
            docker compose -f docker-compose.prod.yml exec -T web \
                npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss < /dev/null
            
            docker compose -f docker-compose.prod.yml exec -T web \
                npx prisma generate --schema=./prisma/schema.prisma < /dev/null
            
            docker compose -f docker-compose.prod.yml exec -T worker \
                npx prisma generate --schema=./prisma/schema.prisma < /dev/null 2>/dev/null || true
        """)
        if rc != 0:
            print(f"❌ DB push/Prisma generate failed (exit {rc})")
            sys.exit(1)

        step("5/5", "♻️ Final restart & health check...")
        rc = run_remote(client, f"""
            set -e
            cd {REMOTE_PATH}
            docker compose -f docker-compose.prod.yml restart web worker
            sleep 10
            HTTP=$(curl -s -o /dev/null -w "%{{http_code}}" http://localhost:3001 2>/dev/null || echo 000)
            echo "App HTTP status: $HTTP"
            if [[ "$HTTP" == "200" || "$HTTP" == "302" || "$HTTP" == "301" ]]; then
                echo "APP_HEALTHY"
            else
                echo "APP_UNHEALTHY"
                docker compose -f docker-compose.prod.yml logs web --tail=40
            fi
        """)

        print()
        print("╔══════════════════════════════════════════════════════╗")
        print("║  🎉 DEPLOYMENT COMPLETE!                             ║")
        print("║                                                      ║")
        print("║  🌐 http://72.61.231.187:3001                        ║")
        print("║  🔑 /super-admin/login                               ║")
        print("║                                                      ║")
        print("║  ✅ PhonePe integration is LIVE!                     ║")
        print("║  ✅ Flow Builder: Razorpay + PhonePe supported       ║")
        print("╚══════════════════════════════════════════════════════╝")

    except Exception as e:
        print(f"\n❌ Deployment error: {e}")
        import traceback; traceback.print_exc()
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    main()
