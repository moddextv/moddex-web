import { asLocale, localePath } from '@/i18n';
import { permanentRedirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ username: string; locale: string }>;
}

export default async function ShortUserPage({ params }: PageProps) {
  const { username, locale } = await params;

  permanentRedirect(localePath(asLocale(locale), `/user/${username}`));
}
