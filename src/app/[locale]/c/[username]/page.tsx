import { asLocale, localePath } from '@/i18n/locales';
import { permanentRedirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ username: string; locale: string }>;
}

export default async function ShortChannelPage({ params }: PageProps) {
  const { username, locale } = await params;

  permanentRedirect(localePath(asLocale(locale), `/channel/${username}`));
}
