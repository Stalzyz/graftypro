FROM node:18-slim AS base
RUN apt-get update -y && apt-get install -y openssl ca-certificates

FROM base AS builder
WORKDIR /app
COPY . .
RUN npm install
ENV DATABASE_URL="postgresql://user:password@postgres:5432/grafty_bsp?schema=public"
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Copy everything from builder to ensure all routes and dependencies are present
COPY --from=builder /app ./

# EXPOSE 3000
CMD ["npm", "start"]
