import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { ImageResponse, type ImageResponseOptions } from 'next/server';

export const runtime = 'edge';

export const alt = 'punchlines.ai';
export const size = {
  width: 1200,
  height: 600
};

export const contentType = 'image/png';

export default async function Image() {
  // const supabase = createPagesBrowserClient();
  // const joke = await supabase
  //   .from('saved_jokes')
  //   .select()
  //   .match({ id: '372e8519-612b-4f6f-837a-1944b24f75d7' })
  //   .single();

  const joke = undefined;

  const fonts: ImageResponseOptions['fonts'] = [
    {
      name: 'mono',
      data: await fetch(
        new URL('../../public/fonts/iAWriterDuoS-Regular.ttf', import.meta.url)
      ).then((res) => res.arrayBuffer()),
      style: 'normal',
      weight: 400
    },
    {
      name: 'mono',
      data: await fetch(
        new URL('../../public/fonts/iAWriterDuoS-Bold.ttf', import.meta.url)
      ).then((res) => res.arrayBuffer()),
      style: 'normal',
      weight: 600
    }
  ];

  return new ImageResponse(
    (
      <div
        style={{
          padding: '20%', // TODO: make dynamic?
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(to bottom, #dbf4ff, #fff1f1)',
          fontSize: 24,
          fontFamily: '"mono"'
        }}
      >
        {/* logo */}
        <div
          style={{
            marginTop: 20,
            position: 'absolute',
            top: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <img width="40" height="40" src="https://punchlines.ai/logo.png" />
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '4px'
            }}
          >
            punchlines.ai
          </div>
        </div>

        {/* punchline card */}
        <div
          style={{
            padding: 40,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 25,
            backgroundColor: '#fff',
            borderRadius: 20
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: 8
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="8" r="5"></circle>
                <path d="M20 21a8 8 0 0 0-16 0"></path>
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              Safety experts now say more and more car crashes are being caused
              by GPS devices.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: 8
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              In a related story, safety experts have apparently never ridden in
              a car with my wife behind the wheel.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts
    }
  );
}
