import 'dotenv/config';

export const config = {
  baseUrl: process.env.NEXTAUTH_URL as string,
  authSecret: process.env.AUTH_SECRET as string,
  twitchClientId: process.env.AUTH_TWITCH_CLIENT_ID as string,
  twitch: {
    clientId: process.env.AUTH_TWITCH_ID as string,
    clientSecret: process.env.AUTH_TWITCH_SECRET as string
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY as string,
    publishableSecretKey: process.env.NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY as string,

    donation: {
      price: process.env.STRIPE_DONATION_PRICE as string,
      default: 5
    }
  },

  db: {
    host: process.env.DB_HOST as string,
    name: process.env.DB_NAME as string,
    user: process.env.DB_USER as string,
    pass: process.env.DB_PASS as string
  }
};
