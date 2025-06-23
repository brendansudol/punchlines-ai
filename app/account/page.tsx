import { redirect } from 'next/navigation';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import {
  getSubscription,
  getUser,
  getUserJokes
} from '@/lib/supabase-server';
import { UpdateSubscriptionButton } from './components/UpdateSubscriptionButton';

export default async function AccountPage() {
  const [user, subscription, jokes] = await Promise.all([
    getUser(),
    getSubscription(),
    getUserJokes()
  ]);

  if (user == null) return redirect('/');

  const joinedDate = formatDate(user.created_at);
  const lastSignIn = formatDate(user.last_sign_in_at);
  const hasSubscription = subscription != null;
  const savedJokesCount = jokes?.length ?? 0;

  return (
    <Container>
      <Header />
      <div className="border-t border-gray-200 pt-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider">
            Account Info
          </h2>
          {joinedDate != null && (
            <p className="text-sm">Joined {joinedDate}.</p>
          )}
          {user.email && <p className="text-sm">Email: {user.email}</p>}
          {lastSignIn && (
            <p className="text-sm">Last sign in {lastSignIn}.</p>
          )}
          {savedJokesCount > 0 && (
            <p className="text-sm">Saved jokes: {savedJokesCount}</p>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Subscription
          </h3>
          {hasSubscription ? (
            <div className="space-y-2">
              <p className="text-sm">You have an active subscription.</p>
              <UpdateSubscriptionButton />
            </div>
          ) : (
            <p className="text-sm">No active subscription.</p>
          )}
        </div>
      </div>
      <Footer />
    </Container>
  );
}

function formatDate(dateString: string | undefined) {
  if (dateString == null || dateString === '') return;

  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
