import type { Metadata } from 'next';
import ConstituencyPageClient from './ConstituencyPageClient';

export const revalidate = 30; // Revalidate every 30 seconds

/* SEO metadata for the constituencies listing page */
export const metadata: Metadata = {
  title: 'All 300 Constituencies | Bangladesh Election Tracker 2026',
  description:
    'Browse all 300 parliamentary constituencies and their live election results for Bangladesh Parliamentary Election 2026. Filter by status, search by name or party, and view seat-by-seat breakdowns.',
  keywords: [
    'Bangladesh constituencies',
    'election results 2026',
    'parliamentary seats',
    'constituency list',
    'Bangladesh election tracker',
    'seat results',
    'vote count',
  ],
  openGraph: {
    title: 'All 300 Constituencies | Bangladesh Election Tracker 2026',
    description:
      'Browse all 300 parliamentary constituencies and their live election results for the Bangladesh Parliamentary Election 2026.',
    type: 'website',
    locale: 'en_BD',
    siteName: 'Bangladesh Election Tracker',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All 300 Constituencies | Bangladesh Election Tracker 2026',
    description:
      'Live election results for all 300 parliamentary constituencies in Bangladesh.',
  },
  alternates: {
    canonical: '/constituency',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ConstituencyPage() {
  return <ConstituencyPageClient />;
}
