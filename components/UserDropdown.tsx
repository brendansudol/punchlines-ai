'use client';

import { User } from '@supabase/supabase-js';
import { ChevronRight, CircleUserRound } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { usePay } from '@/hooks/usePay';
import { useSignOut } from '@/hooks/useSignOut';

export function UserDropdown({
  user,
  hasSubscription
}: {
  user: User;
  hasSubscription: boolean;
}) {
  const { signOut } = useSignOut();
  const { handlePay } = usePay(hasSubscription);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full text-xs" size="sm" variant="secondary">
          <CircleUserRound className="mr-2 h-5 w-5" /> My account
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="font-normal truncate">
            <div className="block text-xs text-gray-500">Signed in as</div>
            <div className="truncate text-sm font-semibold">{user.email}</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hasSubscription ? (
          <DropdownMenuLabel>
            <div className="flex items-center justify-between">
              <div className="font-normal text-sm">Unlimited remaining</div>
              <div className="text-lg leading-none">🎉</div>
            </div>
          </DropdownMenuLabel>
        ) : (
          <DropdownMenuItem onClick={handlePay}>
            <div className="text-sm underline">
              <span className="underline">Upgrade</span> for unlimited joke
              generations
            </div>
            <DropdownMenuShortcut>
              <ChevronRight className="h-5 w-5" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/saved">Saved jokes</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">Account details</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
