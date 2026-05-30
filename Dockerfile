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

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Copy everything from builder instead of reinstalling
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/dist ./dist

COPY prisma ./prisma

EXPOSE 4040

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]