# ============================================================
# Multi-stage Dockerfile for MawaqetSalat (Next.js 15)
# Stage 1 – deps:    install production dependencies
# Stage 2 – builder: build the Next.js app
# Stage 3 – runner:  lean production image
# ============================================================

# ---- Stage 1: Install dependencies -------------------------
FROM node:20-alpine AS deps

# Install libc compatibility shims for some native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy lockfiles first for better layer caching
COPY package.json package-lock.json ./

RUN npm ci --omit=dev


# ---- Stage 2: Build the application -----------------------
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy all deps (including devDeps needed for the build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js app
RUN npm run build


# ---- Stage 3: Production runner ---------------------------
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy the standalone Next.js output and static assets
# (requires `output: 'standalone'` in next.config.ts — see below)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Railway injects PORT at runtime; Next.js reads it automatically
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
