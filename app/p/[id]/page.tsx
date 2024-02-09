import { ArrowRight, Bot, UserRound } from 'lucide-react';
import { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { createServerSupabaseClient } from '@/lib/supabase-server';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params: { id } }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const url = `https://punchlines.ai/p/${id}`;
  const { openGraph } = await parent;

  return {
    openGraph: { ...openGraph, url }
  };
}

export default async function PunchlinePage({ params: { id } }: Props) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('saved_jokes')
    .select()
    .match({ id })
    .single();

  if (data == null) {
    return notFound();
  }

  return (
    <Container>
      <Header />
      <div className="border-t border-gray-200 pt-8">
        <div className="p-6 sm:p-8 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="mb-4 sm:mb-6 flex items-start space-x-3">
            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow bg-background">
              <UserRound className="h-4 w-4" />
            </div>
            <div className="pt-1 min-w-0 flex-1">{data.setup}</div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="pt-1 min-w-0 flex-1">{data.punchline}</div>
          </div>
        </div>
        <div className="mt-6">
          <Button size="sm" variant="outline" asChild>
            <Link href="/">
              Generate more jokes <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <Footer />
    </Container>
  );
}
