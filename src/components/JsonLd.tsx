import { config } from '@/config';
import { FC } from 'react';

type Node = Record<string, unknown>;

// a login would otherwise be able to close the script tag it sits in
const serialize = (data: Node): string => JSON.stringify(data).replace(/</g, '\\u003c');

export const JsonLd: FC<{ data: Node }> = ({ data }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(data) }} />
);

const publisher = {
  '@type': 'Organization',
  name: config.brand.name,
  url: config.brand.url,
  logo: `${config.brand.url}/icon-512.png`
};

export const siteGraph = (): Node => ({
  '@context': 'https://schema.org',
  '@graph': [
    { ...publisher, '@id': `${config.brand.url}/#organization` },
    {
      '@type': 'WebSite',
      '@id': `${config.brand.url}/#website`,
      name: config.brand.name,
      url: config.brand.url,
      inLanguage: 'en',
      publisher: { '@id': `${config.brand.url}/#organization` }
    }
  ]
});

export const profileGraph = (kind: 'channel' | 'user', login: string, name: string): Node => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfilePage',
      url: `${config.brand.url}/${kind}/${login}`,
      name,
      isPartOf: { '@id': `${config.brand.url}/#website` },
      mainEntity: { '@type': 'Person', name, alternateName: login, identifier: login }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: config.brand.name, item: config.brand.url },
        {
          '@type': 'ListItem',
          position: 2,
          name: kind === 'channel' ? 'Channels' : 'Accounts',
          item: `${config.brand.url}/${kind}`
        },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ]
});
