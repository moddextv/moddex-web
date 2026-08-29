export const config = {
  brand: {
    name: 'moddex',
    domain: 'moddex.tv',
    url: 'https://moddex.tv',
    statusUrl: 'https://status.moddex.tv',
    docsUrl: 'https://api.moddex.tv/docs',
    githubUrl: 'https://github.com/moddextv',
    authorUrl: 'https://maersux.dev',
    ffzUrl: 'https://www.frankerfacez.com',
    discordUrl: 'https://discord.gg/qhJEfAwRJ9',
    email: 'marcel@doubt.ch'
  },

  i18n: {
    defaultLocale: 'en',

    // the key is the url segment; `tag` is the bcp-47 form Intl and og want.
    // `flag` names a file in public/flags and is a separate choice on purpose:
    // a language is not a country, so it may disagree with the tag's region
    locales: {
      en: { name: 'English', tag: 'en-US', flag: 'gb' },
      de: { name: 'Deutsch', tag: 'de-DE', flag: 'de' },
      fr: { name: 'Français', tag: 'fr-FR', flag: 'fr' }
    }
  } as const,

  stripe: {
    publishableSecretKey: process.env.NEXT_PUBLIC_PUBLISHABLE_SECRET_KEY as string,

    donation: {
      default: 5
    }
  }
};
