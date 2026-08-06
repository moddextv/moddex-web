import { permanentRedirect } from 'next/navigation';

interface PageProps {
  params: { username: string };
}

/**
 * short share url: /c/<name> -> /channel/<name>
 *
 * these used to live on a separate short-link domain (mdc.lol). on a .tv domain
 * the canonical url is already short enough, so the redirect is served by the
 * app itself and there is no second domain to keep alive.
 */
export default function ShortChannelPage({ params }: PageProps) {
  permanentRedirect(`/channel/${params.username}`);
}
