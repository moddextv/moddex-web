export const config = {
  brand: {
    name: 'moddex',
    domain: 'moddex.tv',
    url: 'https://moddex.tv',
    statusUrl: 'https://status.moddex.tv',
    docsUrl: 'https://api.moddex.tv/docs',
    githubUrl: 'https://github.com/moddextv',
    authorUrl: 'https://maersux.dev',
    email: 'marcel@doubt.ch'
  },

  stripe: {
    publishableSecretKey: process.env.NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY as string,

    donation: {
      default: 5
    }
  }
};
