import { Bot, UserRound } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { getUserJokes } from '@/lib/supabase-server';

export default async function SavedJokesPage() {
  const jokes = await getUserJokes();

  if (jokes == null) {
    return redirect('/');
  }

  return (
    <Container>
      <Header />
      <div className="border-t border-gray-100 pt-8">
        {jokes.length === 0 ? (
          <div className="px-6 py-8 sm:px-8 sm:py-10 bg-slate-100 rounded-2xl">
            <div className="text-sm font-bold uppercase tracking-wider text-center">
              No jokes (yet!)
            </div>
          </div>
        ) : (
          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">
              My saved jokes
            </h2>
            <div className="flex flex-col space-y-6">
              {jokes.map((joke) => (
                <Link
                  key={joke.id}
                  className="p-6 sm:p-8 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-2xl"
                  href={`/p/${joke.id}`}
                  prefetch={false}
                >
                  <div className="mb-4 sm:mb-6 flex items-start space-x-3">
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow bg-background">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div className="pt-1 min-w-0 flex-1">{joke.setup}</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="pt-1 min-w-0 flex-1">{joke.punchline}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </Container>
  );
}
