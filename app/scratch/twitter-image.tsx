import { ImageResponse } from 'next/server';

export const runtime = 'edge';

export const alt = 'punchlines.ai';
export const size = {
  width: 1200,
  height: 600
};

export const contentType = 'image/png';

export default async function Image() {
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
            fontSize: 60,
            fontStyle: 'normal',
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
