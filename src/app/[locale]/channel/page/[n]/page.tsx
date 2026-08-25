import { BrowsePageView } from '@/components/Browse/BrowsePageView';
import { asLocale } from '@/i18n/locales';
import { config } from '@/config';
import { browsePagePath, parseBrowsePage } from '@/misc/browsePages';
import { alternatesFor, openGraphFor } from '@/misc/metadata';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ n: string; locale: string }>;
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { n, locale: raw } = await params;
  const locale = asLocale(raw);
  const page = parseBrowsePage(n);

  if (page === null) return { title: 'Channels', robots: { index: false, follow: false } };

  const path = browsePagePath('channel', page);

  return {
    title: `Channels · page ${page}`,
    description: `Page ${page} of the Twitch channels ${config.brand.name} has indexed, ordered by how many mod and vip roles each hands out.`,
    alternates: alternatesFor(path, locale),
    openGraph: openGraphFor(path, locale)
  };
};

export default async function ChannelBrowsePage({ params }: PageProps) {
  const { n, locale: raw } = await params;
  const locale = asLocale(raw);
  const page = parseBrowsePage(n);

  if (page === null) notFound();

  return <BrowsePageView axis="channel" page={page} locale={locale} />;
}
