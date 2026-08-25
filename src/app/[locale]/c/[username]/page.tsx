import { permanentRedirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function ShortChannelPage({ params }: PageProps) {
  const { username } = await params;

  permanentRedirect(`/channel/${username}`);
}
