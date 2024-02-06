import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { ImageResponse } from 'next/server';

export const runtime = 'edge';

export const alt = 'punchlines.ai';
export const size = {
  width: 1200,
  height: 600
};

export const contentType = 'image/png';

export default async function Image() {
  const supabase = createPagesBrowserClient();
  const joke = await supabase
    .from('saved_jokes')
    .select()
    .match({ id: '372e8519-612b-4f6f-837a-1944b24f75d7' })
    .single();

  const monospaceFont = fetch(
    new URL('../../public/fonts/iAWriterDuoS-Bold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundImage: 'linear-gradient(to bottom, #dbf4ff, #fff1f1)'
        }}
      >
        <img width="100" height="100" src="https://punchlines.ai/logo.png" />
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            fontSize: 20,
            fontStyle: 'normal',
            color: 'black',
            lineHeight: 1.5,
            textTransform: 'uppercase',
            letterSpacing: '4px'
          }}
        >
          {joke?.data?.setup ?? 'STAY TUNED!'}
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            marginTop: 20,
            fontSize: 20,
            fontStyle: 'normal',
            color: 'black',
            lineHeight: 1.5,
            textTransform: 'uppercase',
            letterSpacing: '4px'
          }}
        >
          {joke?.data?.punchline ?? 'STAY TUNED!'}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'monospace',
          data: await monospaceFont,
          style: 'normal',
          weight: 400
        }
      ]
    }
  );
}
