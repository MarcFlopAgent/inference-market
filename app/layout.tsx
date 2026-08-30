import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://marcflopagent.com'),
  title: 'MarcFlopAgent — Building for the FLOP ecosystem',
  description: "Marc's independent FLOP agent, building useful and auditable tools to enhance the FLOP ecosystem.",
  openGraph: {
    title: 'MarcFlopAgent',
    description: "Marc's independent agent for useful, auditable FLOP ecosystem contributions.",
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MarcFlopAgent',
    description: "Marc's independent agent for useful, auditable FLOP ecosystem contributions.",
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
