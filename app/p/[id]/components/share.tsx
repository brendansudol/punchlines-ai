import type { ImageResponseOptions } from 'next/server';
import type { Database } from '@/types/db';

type Joke = Database['public']['Tables']['saved_jokes']['Row'];

export function ShareImage({ joke }: { joke: Joke | null }) {
  const { setup, punchline } = joke ?? {};

  if (setup == null || punchline == null) {
    return <ShareFallback />;
  }

  return <ShareJoke setup={setup} punchline={punchline} />;
}

function ShareJoke({ setup, punchline }: { setup: string; punchline: string }) {
  return (
    <div
      style={{
        padding: '12%', // TODO: make dynamic?
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(to bottom, #dbf4ff, #fff1f1)',
        fontSize: 30,
        lineHeight: 1.25,
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
        <img width="60" height="60" src="https://punchlines.ai/logo.png" />
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '4px'
          }}
        >
          punchlines<span style={{ color: '#06b6d4' }}>.</span>ai
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
          gap: 40,
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
          <div style={{ minWidth: 0, flex: 1, marginTop: -5 }}>{setup}</div>
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
          <div style={{ minWidth: 0, flex: 1, marginTop: -5 }}>{punchline}</div>
        </div>
      </div>
    </div>
  );
}

function ShareFallback() {
  return (
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
          fontSize: 60,
          fontWeight: '600',
          color: 'black',
          lineHeight: 1.5,
          textTransform: 'uppercase',
          letterSpacing: '4px'
        }}
      >
        punchlines
        <span style={{ color: '#06b6d4' }}>.</span>
        ai
      </div>
    </div>
  );
}

export async function getFonts(): Promise<ImageResponseOptions['fonts']> {
  return [
    {
      name: 'mono',
      data: await fetch(
        new URL(
          '../../../../public/fonts/iAWriterDuoS-Regular.ttf',
          import.meta.url
        )
      ).then((res) => res.arrayBuffer()),
      style: 'normal',
      weight: 400
    },
    {
      name: 'mono',
      data: await fetch(
        new URL(
          '../../../../public/fonts/iAWriterDuoS-Bold.ttf',
          import.meta.url
        )
      ).then((res) => res.arrayBuffer()),
      style: 'normal',
      weight: 600
    }
  ];
}
