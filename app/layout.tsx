import '@/styles/global.css';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';
import { SupabaseProvider } from '@/components/SupabaseProvider';
import { getURL } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'punchlines.ai :: Generate jokes with AI',
  description:
    'Meet your new AI comedy writing partner — you provide a joke set-up, and it generates the zingers. The AI was built using GPT language models and fine-tuned with thousands of late night comedy monologue jokes.',
  metadataBase: new URL(getURL()),
  robots: 'follow, index',
  openGraph: {
    url: getURL(),
    title: 'punchlines.ai',
    description: 'Generate jokes with AI',
    type: 'website',
    images: '/share.png'
  },
  twitter: {
    title: 'punchlines.ai',
    description: 'Generate jokes with AI',
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
