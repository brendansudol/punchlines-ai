import type { Metadata } from 'next';
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  twitter: {
    card: 'summary_large_image'
  }
};

export default async function AboutPage() {
  return (
    <Container>
      <div>testing testing</div>
    </Container>
  );
}
