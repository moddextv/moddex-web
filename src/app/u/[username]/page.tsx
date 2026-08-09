import { permanentRedirect } from 'next/navigation';

interface PageProps {
  // a promise since next 15 — see the sibling /c route
  params: Promise<{ username: string }>;
}

/**
 * short share url: /u/<name> -> /user/<name>. see the sibling /c route.
 */
export default async function ShortUserPage({ params }: PageProps) {
  const { username } = await params;

  permanentRedirect(`/user/${username}`);
}
