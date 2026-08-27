import { Metadata } from 'next';
import { UnknownPage } from '@/components/Errors';

// drawn rather than thrown: a thrown not-found answers with an empty body in
// this tree, and a streamed 404 is a 200 carrying noindex anyway
export const metadata: Metadata = {
  title: 'not found',
  robots: { index: false, follow: false }
};

export default function UnmatchedPage() {
  return <UnknownPage />;
}
