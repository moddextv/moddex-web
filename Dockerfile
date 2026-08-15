# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4999
CMD ["npm", "run", "dev"]

FROM base AS builder

ARG NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY
ENV NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY=$NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY

ENV NEXTAUTH_URL=http://localhost:4999 \
    AUTH_SECRET=build \
    AUTH_TWITCH_ID=build \
    AUTH_TWITCH_SECRET=build \
    STRIPE_SECRET_KEY=sk_test_build \
    STRIPE_DONATION_PRICE=price_build

ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build \
 && rm -rf .next/cache .next/standalone/.next/cache

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=4999 \
    HOSTNAME=0.0.0.0

LABEL org.opencontainers.image.source=https://github.com/moddextv/moddex-web

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p .next/cache && chown nextjs:nodejs .next/cache

USER nextjs
EXPOSE 4999

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4999/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
