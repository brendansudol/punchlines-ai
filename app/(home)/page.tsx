import React, { useMemo } from 'react';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { getRandomExamples } from '@/lib/data';
import { MainContent } from './components/MainContent';

export default function HomePage() {
  const examples = useMemo(() => getRandomExamples(), []);

  return (
    <Container>
      <Header />
      <MainContent examples={examples} />
      <Footer />
    </Container>
  );
}
