import { asLocale, localePath } from '@/i18n/locales';
import { roleTabIndex } from '@/misc/roles';
import { permanentRedirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ username: string; locale: string; role?: string[] }>;
}

export default async function ShortChannelPage({ params }: PageProps) {
  const { username, locale, role } = await params;
  const segment = role?.length === 1 && roleTabIndex(role[0]) !== null ? `/${role[0]}` : '';

  permanentRedirect(localePath(asLocale(locale), `/channel/${username}${segment}`));
}
