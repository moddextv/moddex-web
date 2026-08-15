import 'server-only';

import 'dotenv/config';

const required = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`missing required environment variable: ${key} — see .env.example`);
  }

  return value;
};

export const serverConfig = {
  baseUrl: required('NEXTAUTH_URL'),

  authSecret: required('AUTH_SECRET'),

  twitch: {
    clientId: required('AUTH_TWITCH_ID'),
    clientSecret: required('AUTH_TWITCH_SECRET')
  },

  stripe: {
    secretKey: required('STRIPE_SECRET_KEY'),
    donation: {
      price: required('STRIPE_DONATION_PRICE')
    }
  }
};
