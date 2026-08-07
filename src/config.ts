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

  /**
   * moddex-api. This app holds no database connection; everything it needs is
   * served by that service. The internal token deliberately does NOT live here
   * -- this module is bundled for the browser (see the note at the top), so it
   * is read in utils/api/moddex.ts, which is marked server-only.
   */
  apiUrl: optional('MODDEX_API_URL', 'https://api.moddex.tv'),

  stripe: {
    secretKey: required('STRIPE_SECRET_KEY'),
    // inlined at build time by next, so it must be present as a --build-arg,
    // not only at runtime.
    publishableSecretKey: process.env
      .NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY as string,

    // no webhookSecret here. the stripe webhook moved to
    // api.moddex.tv/v1/stripe/webhook in phase 2, so STRIPE_WEBHOOK_SECRET
    // belongs to moddex-api's .env and nothing in this app reads it. this app
    // still needs secretKey: it creates the checkout session (/api/checkout)
    // and reads it back on /donate/success.

    donation: {
      price: required('STRIPE_DONATION_PRICE'),
      default: 5
    }
  },

};
