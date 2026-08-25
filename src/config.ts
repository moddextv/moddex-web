export const config = {
  brand: {
    name: 'moddex',
    domain: 'moddex.tv',
    url: 'https://moddex.tv',
    statusUrl: 'https://status.moddex.tv',
    docsUrl: 'https://api.moddex.tv/docs',
    githubUrl: 'https://github.com/moddextv',
    authorUrl: 'https://maersux.dev',
    discordUrl: 'https://discord.gg/qhJEfAwRJ9',
    email: 'marcel@doubt.ch'
  },

  i18n: {
    defaultLocale: 'en',

    // the key is the url segment; `tag` is the bcp-47 form Intl and og want
    locales: {
      en: { name: 'English', tag: 'en-US' },
      de: { name: 'Deutsch', tag: 'de-DE' }
    }
  } as const,

  stripe: {
    publishableSecretKey: process.env.NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY as string,

    donation: {
      default: 5
    }
  }
};
