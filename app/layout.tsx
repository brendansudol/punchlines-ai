import '@/styles/global.css';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';
import { SupabaseProvider } from '@/components/SupabaseProvider';
import { METADATA } from '@/lib/consts';
import { getURL } from '@/lib/utils';

export const metadata: Metadata = {
  title: METADATA.title,
  description: METADATA.descriptionLong,
  metadataBase: new URL(getURL()),
  robots: 'follow, index',
  openGraph: {
    url: getURL(),
    title: METADATA.title,
    description: METADATA.descriptionShort
  },
  twitter: {
    title: METADATA.title,
    description: METADATA.descriptionShort,
    card: 'summary_large_image',
    images: '/share.png'
  }
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body>
        <SupabaseProvider>
          {children}
          <Toaster position="top-right" />
        </SupabaseProvider>
        <Analytics />
      </body>
    </html>
  );
}
