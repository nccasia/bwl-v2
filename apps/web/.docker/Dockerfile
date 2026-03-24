# Stage 1: Base image and runtime user
FROM node:20-alpine AS base

RUN addgroup -g 1001 -S nextjs && \
    adduser -u 1001 -S nextjs -G nextjs

WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Stage 3: Build
FROM deps AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV BUILD_TYPE=standalone
RUN yarn build

# Stage 4: Production runner
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

# Copy the standalone output and static files with correct ownership
COPY --chown=nextjs:nextjs --from=builder /app/public ./public
COPY --chown=nextjs:nextjs --from=builder /app/i18n ./i18n
COPY --chown=nextjs:nextjs --from=builder /app/messages ./messages

RUN mkdir .next

COPY --chown=nextjs:nextjs --from=builder /app/.next/standalone ./
COPY --chown=nextjs:nextjs --from=builder /app/.next/static ./.next/static

# Entrypoint
COPY --chown=nextjs:nextjs .docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
