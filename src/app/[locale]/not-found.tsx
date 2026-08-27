import { UnknownPage } from '@/components/Errors';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'not found'
};

// for a notFound() thrown by a page below: this renders inside the layout, so
// it carries the shell and the language already there. global-not-found.tsx is
// the one for a url that matches nothing
export default function NotFoundPage() {
  return <UnknownPage />;
}
