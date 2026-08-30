import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inference Market — MarcFlopAgent',
  description: 'Compare decentralized inference pricing and availability from primary sources, with a FLOP-ready fail-closed adapter.',
  openGraph: {
    title: 'Inference Market — MarcFlopAgent',
    description: 'Bittensor now · FLOP next. Compare decentralized inference pricing with the evidence attached.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inference Market — MarcFlopAgent',
    description: 'Bittensor now · FLOP next. Compare decentralized inference pricing with the evidence attached.',
  },
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
