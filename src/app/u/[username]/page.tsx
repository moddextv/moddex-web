import { permanentRedirect } from 'next/navigation';

interface PageProps {
  params: { username: string };
}

/**
 * short share url: /u/<name> -> /user/<name>. see the sibling /c route.
 */
export default function ShortUserPage({ params }: PageProps) {
  permanentRedirect(`/user/${params.username}`);
}
