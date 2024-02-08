import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { ImageResponse } from 'next/server';
import { Database } from '@/types/db';
import { getFonts, ShareImage } from './components/share';

export const runtime = 'edge';
export const alt = 'punchlines.ai';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params: { id }
}: {
  params: { id: string };
}) {
  const supabase = createPagesBrowserClient<Database>();
  const { data: joke } = await supabase
    .from('saved_jokes')
    .select()
    .match({ id })
    .single();

  const options = { ...size, fonts: await getFonts() };
  return new ImageResponse(<ShareImage joke={joke} />, options);
}
