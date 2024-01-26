import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { getRandomExamples } from '@/lib/data';
import { getSubscription, getUser } from '@/lib/supabase-server';
import { MainContent } from './components/MainContent';

export default async function HomePage() {
  const examples = getRandomExamples();
  const [user, subscription] = await Promise.all([
    getUser(),
    getSubscription()
  ]);

  const isSignedIn = user != null;
  const hasSubscription = subscription != null;

  return (
    <Container>
      <Header />
      <MainContent
        examples={examples}
        hasSubscription={hasSubscription}
        isSignedIn={isSignedIn}
      />
      <Footer />
    </Container>
  );
}
