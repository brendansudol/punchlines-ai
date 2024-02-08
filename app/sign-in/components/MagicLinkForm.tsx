'use client';

import { AlertCircle, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Status = 'NOT_STARTED' | 'LOADING' | 'ERROR' | 'SUCCESS';

export function MagicLinkForm() {
  const { supabase } = useSupabase();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('NOT_STARTED');

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('LOADING');
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      setStatus(error != null ? 'ERROR' : 'SUCCESS');
    } catch (error) {
      console.error(error);
      setStatus('ERROR');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>
          Sign in to generate more jokes and save your favorites.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-1">
            <Label htmlFor="name">Email</Label>
            <Input
              autoFocus={true}
              id="email"
              type="email"
              disabled={status === 'LOADING' || status === 'SUCCESS'}
              required={true}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {status === 'LOADING' ? (
            <Button className="w-full" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Button>
          ) : (
            <Button
              className="w-full"
              type="submit"
              disabled={status === 'SUCCESS'}
            >
              Continue
            </Button>
          )}
        </form>
        {status === 'SUCCESS' ? (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Go check your email! It has a magic link that'll sign you in.
            </AlertDescription>
          </Alert>
        ) : status === 'ERROR' ? (
          <Alert variant="error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Whoops! Something went wrong. Please try again shortly.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="secondary">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              We'll email you a magic link for a password-free sign in.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
