# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-lock.yaml ./

# Install all deps (including devDeps needed for build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client
RUN pnpx prisma generate

# Build NestJS
RUN pnpm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-lock.yaml ./

# Install production deps only
RUN pnpm install --frozen-lockfile --prod

# Copy generated Prisma client from builder
COPY --from=builder /app/generated ./generated

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy prisma schema (needed for migrations at runtime)
COPY prisma ./prisma

EXPOSE 4040

# Run migrations then start
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]