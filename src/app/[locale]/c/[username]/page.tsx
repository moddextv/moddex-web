import { permanentRedirect } from 'next/navigation';
import { asLocale, localePath } from '@/i18n/locales';

interface PageProps {
  params: Promise<{ username: string; locale: string }>;
}

export default async function ShortChannelPage({ params }: PageProps) {
  const { username, locale } = await params;

  permanentRedirect(localePath(asLocale(locale), `/channel/${username}`));
}
