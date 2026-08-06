import 'dotenv/config';

/**
 * NOTE: this module is reachable from client components (utils/stripe.ts reads
 * config.stripe.publishableSecretKey), so it is bundled for the browser too.
 * only NEXT_PUBLIC_* values survive that bundling — everything else is
 * undefined client-side, which is why validation is guarded below.
 *
 * phase 3.4 should split this into config.ts (public) and serverConfig.ts.
 */
const isServer = typeof window === 'undefined';

const required = (key: string): string => {
  const value = process.env[key];

  if (isServer && !value) {
    throw new Error(
      `missing required environment variable: ${key} — see .env.example`
    );
  }

  return value as string;
};

const optional = (key: string, fallback: string): string =>
  process.env[key] || fallback;

export const config = {
  /**
   * single source of truth for the brand. nothing else in the codebase should
   * spell the name or the domain — that is what made the last rename expensive.
   */
  brand: {
    name: 'moddex',
    domain: 'moddex.tv',
    url: 'https://moddex.tv',
    statusUrl: 'https://status.moddex.tv',
    email: 'marcel@doubt.ch'
  },

  baseUrl: required('NEXTAUTH_URL'),
  authSecret: required('AUTH_SECRET'),
  twitchClientId: required('AUTH_TWITCH_CLIENT_ID'),
  twitch: {
    clientId: required('AUTH_TWITCH_ID'),
    clientSecret: required('AUTH_TWITCH_SECRET')
  },

  stripe: {
    secretKey: required('STRIPE_SECRET_KEY'),
    // inlined at build time by next, so it must be present as a --build-arg,
    // not only at runtime.
    publishableSecretKey: process.env
      .NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY as string,

    // deliberately not required(): a missing webhook secret must not take the
    // whole app down at import. /api/stripe/webhook checks it per request and
    // refuses to process anything unsigned.
    webhookSecret: optional('STRIPE_WEBHOOK_SECRET', ''),

    donation: {
      price: required('STRIPE_DONATION_PRICE'),
      default: 5
    }
  },

  db: {
    host: required('DB_HOST'),
    port: Number(optional('DB_PORT', '3306')),
    name: required('DB_NAME'),
    user: required('DB_USER'),
    pass: required('DB_PASS'),
    connectionLimit: Number(optional('DB_CONNECTION_LIMIT', '10'))
  }
};
