import { permanentRedirect } from 'next/navigation';

interface PageProps {
  // a promise since next 15 — route params arrive asynchronously so a page can
  // start rendering before they are known
  params: Promise<{ username: string }>;
}

/**
 * short share url: /c/<name> -> /channel/<name>
 *
 * these used to live on a separate short-link domain (mdc.lol). on a .tv domain
 * the canonical url is already short enough, so the redirect is served by the
 * app itself and there is no second domain to keep alive.
 */
export default async function ShortChannelPage({ params }: PageProps) {
  const { username } = await params;

  permanentRedirect(`/channel/${username}`);
}
