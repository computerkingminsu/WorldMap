import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import LayoutHeader from './layout/layoutHeader';
import { Toaster } from '@/components/ui/toaster';

const notoSansKr = Noto_Sans_KR({
  weight: ['500'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GoTrip',
  description:
    'GoTrip은 AI를 이용하여 사용자가 선호하는 여행지를 추천하고 맞춤형 여행 계획을 제공하는 웹사이트 입니다.',
  openGraph: {
    url: 'https://gotrip-iota.vercel.app/',
    type: 'website',
    title: 'GoTrip',
    description:
      'GoTrip은 AI를 이용하여 사용자가 선호하는 여행지를 추천하고 맞춤형 여행 계획을 제공하는 웹사이트 입니다.',
    images: [
      {
        url: '/openGraph.jpg',
        width: 1200,
        height: 630,
        alt: 'GoTrip',
      },
    ],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1, minimum-scale=1"
        />
      </head>
      <body className={`${notoSansKr.className}`}>
        <LayoutHeader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
