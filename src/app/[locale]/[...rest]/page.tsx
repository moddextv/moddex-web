import { Metadata } from 'next';
import { UnknownPage } from '@/components/Errors';

// rendered rather than thrown: notFound() would answer 404 with an empty body,
// and a streamed 404 is a 200 with noindex either way — next's own docs
export const metadata: Metadata = {
  title: 'not found',
  robots: { index: false, follow: false }
};

export default function UnmatchedPage() {
  return <UnknownPage />;
}
