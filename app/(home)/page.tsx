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

  return (
    <Container>
      <Header showDescription />
      <MainContent
        examples={examples}
        isSignedIn={user != null}
        hasSubscription={subscription != null}
      />
      <Footer />
    </Container>
  );
}
