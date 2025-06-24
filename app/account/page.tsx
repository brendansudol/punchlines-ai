import { redirect } from 'next/navigation';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { getSubscription, getUser } from '@/lib/supabase-server';
import { UpdateSubscriptionButton } from './components/UpdateSubscriptionButton';
import { SubscribeButton } from './components/SubscribeButton';

export default async function AccountPage() {
  const [user, subscription] = await Promise.all([
    getUser(),
    getSubscription()
  ]);

  if (user == null) return redirect('/');

  const joinedDate = formatDate(user.created_at);
  const hasSubscription = subscription != null;

  return (
    <Container>
      <Header />
      <div className="border-t border-gray-200 pt-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider">
            Account Details
          </h2>
          {user.email && <p className="text-sm">Email: {user.email}</p>}
          {joinedDate != null && (
            <p className="text-sm">Joined: {joinedDate}</p>
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
            <div className="space-y-2">
              <p className="text-sm">No active subscription.</p>
              <SubscribeButton />
            </div>
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
