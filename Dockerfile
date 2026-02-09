FROM node:18-slim AS base
RUN apt-get update -y && apt-get install -y openssl ca-certificates

FROM base AS builder
WORKDIR /app

# COPY everything first to ensure schema and code are available
COPY . .

# Install all dependencies including devDependencies (needed for build)
RUN npm install

# Hardcode the URL for the generation stage to avoid "empty host" during build
ENV DATABASE_URL="postgresql://user:password@postgres:5432/wabot_bsp?schema=public"

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/worker.ts ./worker.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/workers ./workers
COPY --from=builder /app/scripts ./scripts

# EXPOSE 3000
CMD ["npm", "start"]
