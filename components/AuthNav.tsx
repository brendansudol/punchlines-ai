import { CircleUserRound } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getSubscription, getUser } from '@/lib/supabase-server';
import { UserDropdown } from './UserDropdown';

export async function AuthNav() {
  const [user, subscription] = await Promise.all([
    getUser(),
    getSubscription()
  ]);

  if (user == null) {
    return (
      <Button
        className="rounded-full text-xs"
        size="sm"
        variant="secondary"
        asChild
      >
        <Link href="/sign-in">
          <CircleUserRound className="mr-2 h-5 w-5" /> Sign in
        </Link>
      </Button>
    );
  }

  return <UserDropdown user={user} hasSubscription={subscription != null} />;
}
