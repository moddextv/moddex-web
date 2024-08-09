import { NotFound } from '@/components/Errors';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'not found'
}

export default function NotFoundPage() {
  return <NotFound message="this page does not exist anymore/yet" />;
}
