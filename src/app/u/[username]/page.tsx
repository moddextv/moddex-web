import { permanentRedirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function ShortUserPage({ params }: PageProps) {
  const { username } = await params;

  permanentRedirect(`/user/${username}`);
}
