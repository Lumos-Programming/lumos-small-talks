# syntax=docker/dockerfile:1

FROM shion1305/pnpm:24-alpine AS base

FROM base AS deps
WORKDIR /app

# Copy only lockfile first for better layer caching
COPY pnpm-lock.yaml ./

# Fetch dependencies into virtual store (doesn't require package.json)
RUN pnpm fetch --prod

# Copy package.json and install from cache
COPY package.json ./
RUN pnpm install --frozen-lockfile --offline --prod

FROM base AS builder
WORKDIR /app

# Install git for local builds (when COMMIT_SHA is not provided)
RUN apk add --no-cache git

# Accept build arguments for version info
ARG COMMIT_SHA
ARG BUILD_DATE

# Copy lockfile for fetch
COPY pnpm-lock.yaml ./

# Fetch all dependencies (including dev)
RUN pnpm fetch

# Copy package.json and install from cache
COPY package.json ./
RUN pnpm install --frozen-lockfile --offline

COPY . .

# Generate version.json before build
# If COMMIT_SHA is not provided, try to get it from git (for local builds)
# If BUILD_DATE is not provided, use current date
RUN mkdir -p lib && \
    COMMIT=${COMMIT_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo "dev")} && \
    BUILD_TIME=${BUILD_DATE:-$(date -u +"%Y-%m-%dT%H:%M:%SZ")} && \
    echo "{\"commitSha\":\"${COMMIT}\",\"buildDate\":\"${BUILD_TIME}\"}" > lib/version.json

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
