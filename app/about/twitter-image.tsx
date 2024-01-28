import { ImageResponse } from 'next/server';

export const runtime = 'edge';

export const alt = 'punchlines.ai';
export const size = {
  width: 1024,
  height: 512
};

export const contentType = 'image/png';

export default async function Image() {
  const duospace = fetch(
    new URL('../../public/fonts/iAWriterDuoS-Regular.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          gap: '20px',
          fontSize: 60,
          fontFamily: '"duospace"',
          color: 'black',
          background: 'white',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <img width="100" height="100" src={`https://punchlines.ai/logo.png`} />
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            textTransform: 'uppercase'
          }}
        >
          punchlines
          <span style={{ color: 'red' }}>.</span>
          ai
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'duospace',
          data: await duospace,
          style: 'normal',
          weight: 400
        }
      ]
    }
  );
}
