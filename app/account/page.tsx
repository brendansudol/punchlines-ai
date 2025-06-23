import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { getSubscription, getUser } from '@/lib/supabase-server';
import { useCustomerPortal } from '@/hooks/useCustomerPortal';

function formatDate(dateString: string | undefined) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default async function AccountPage() {
  const [user, subscription] = await Promise.all([
    getUser(),
    getSubscription()
  ]);

  if (user == null) {
    return redirect('/');
  }

  const joined = formatDate(user.created_at);
  const hasSubscription = subscription != null;

  return (
    <Container>
      <Header />
      <div className="border-t border-gray-200 pt-8 space-y-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-1">
            Account Info
          </h2>
          <p className="text-sm">Joined {joined}</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider">Subscription</h3>
          {hasSubscription ? (
            <SubscriptionSection />
          ) : (
            <p className="text-sm">No active subscription.</p>
          )}
        </div>
      </div>
      <Footer />
    </Container>
  );
}

function SubscriptionSection() {
  // Client component wrapper to use hook
  return (
    <div className="flex items-center space-x-4">
      <p className="text-sm">You have an active subscription.</p>
      {/* @ts-expect-error Server Component */}
      <UpdateSubscriptionButton />
    </div>
  );
}

function UpdateSubscriptionButton() {
  'use client';
  const { openPortal } = useCustomerPortal();
  return (
    <Button size="sm" onClick={openPortal}>
      Update subscription
    </Button>
  );
}
