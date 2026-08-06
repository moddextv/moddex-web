# syntax=docker/dockerfile:1

# ---------------------------------------------------------------- base ------
FROM node:22-alpine AS base
# sharp and the next swc binaries need glibc compatibility shims on alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app


# ---------------------------------------------------------------- deps ------
# separate stage so a source-only change does not reinstall node_modules
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci


# ----------------------------------------------------------------- dev ------
# target used by compose.yaml; source is bind-mounted over /app at runtime
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4999
CMD ["npm", "run", "dev"]


# -------------------------------------------------------------- builder -----
FROM base AS builder

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so
# this one has to be present here — supplying it only at runtime leaves stripe
# checkout with an undefined publishable key in the browser.
ARG NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY
ENV NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY=$NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY

# src/config.ts throws on missing server-side env vars, and `next build`
# evaluates it while prerendering. these are build-time placeholders only —
# the real values are injected at runtime by compose.
ENV NEXTAUTH_URL=http://localhost:4999 \
    AUTH_SECRET=build \
    AUTH_TWITCH_ID=build \
    AUTH_TWITCH_SECRET=build \
    AUTH_TWITCH_CLIENT_ID=build \
    STRIPE_SECRET_KEY=sk_test_build \
    STRIPE_DONATION_PRICE=price_build

ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NOTE: next/font/google downloads Lato and Cairo here, so this stage needs
# network access. self-host the fonts if you ever build somewhere airgapped.
#
# next mirrors its webpack build cache (~390 MB) into the standalone output.
# it has to go before the runner COPYs it, since deleting it in a later layer
# would leave it in the image anyway.
RUN npm run build \
 && rm -rf .next/cache .next/standalone/.next/cache


# --------------------------------------------------------------- runner -----
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=4999 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# standalone already contains the traced subset of node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# next writes its runtime image cache here and the process runs unprivileged
RUN mkdir -p .next/cache && chown nextjs:nodejs .next/cache

USER nextjs
EXPOSE 4999

CMD ["node", "server.js"]
