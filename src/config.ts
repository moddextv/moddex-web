import 'dotenv/config';

export const config = {
  dev: true,
  baseUrl: 'https://modchecker.com',
  authSecret: process.env.AUTH_SECRET as string,
  twitchClientId: process.env.AUTH_TWITCH_CLIENT_ID as string,
  twitch: {
    clientId: process.env.AUTH_TWITCH_ID as string,
    clientSecret: process.env.AUTH_TWITCH_SECRET as string
  },

  db: {
    host: process.env.DB_HOST as string,
    name: process.env.DB_NAME as string,
    user: process.env.DB_USER as string,
    pass: process.env.DB_PASS as string
  }
};
