import { asLocale } from '@/i18n/locales';
import { BrowsePageView } from '@/components/Browse/BrowsePageView';
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

  if (page === null) return { title: 'Accounts', robots: { index: false, follow: false } };

  const path = browsePagePath('user', page);

  return {
    title: `Accounts · page ${page}`,
    description: `Page ${page} of the Twitch accounts ${config.brand.name} holds role records for, ordered by how many channels each holds a role in.`,
    alternates: alternatesFor(path, locale),
    openGraph: openGraphFor(path, locale)
  };
};

export default async function UserBrowsePage({ params }: PageProps) {
  const { n, locale: raw } = await params;
  const locale = asLocale(raw);
  const page = parseBrowsePage(n);

  if (page === null) notFound();

  return <BrowsePageView axis="user" page={page} locale={locale} />;
}
