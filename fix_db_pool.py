import re

COMPOSE_PATH = "/root/grafty_bsp/docker-compose.prod.yml"

with open(COMPOSE_PATH, "r") as f:
    content = f.read()

# Add connection pool params to both web and worker DATABASE_URL entries
# The current value is: postgresql://user:password@postgres:5432/wabot_bsp?schema=public
OLD = "postgresql://user:password@postgres:5432/wabot_bsp?schema=public"
NEW = "postgresql://user:password@postgres:5432/wabot_bsp?schema=public&connection_limit=25&pool_timeout=30"

if "connection_limit" in content:
    print("connection_limit already present in docker-compose.prod.yml — skipping")
else:
    updated = content.replace(OLD, NEW)
    if updated == content:
        print("ERROR: Pattern not found in docker-compose.prod.yml!")
    else:
        with open(COMPOSE_PATH, "w") as f:
            f.write(updated)
        count = content.count(OLD)
        print(f"Updated {count} occurrence(s) of DATABASE_URL in docker-compose.prod.yml")

# Verify
with open(COMPOSE_PATH, "r") as f:
    for i, line in enumerate(f, 1):
        if "DATABASE_URL" in line:
            print(f"Line {i}: {line.rstrip()}")
