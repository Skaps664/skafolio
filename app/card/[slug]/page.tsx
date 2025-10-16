/**
 * Public Card View Page
 * Route: /card/[slug]
 * Optimized SSR with ISR for performance
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import CardView from '@/components/CardView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO and Open Graph
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const card = await prisma.card.findFirst({
    where: {
      slug: resolvedParams.slug,
      isPublished: true,
    },
    select: {
      title: true,
      data: true,
    },
  });

  if (!card) {
    return {
      title: 'Card Not Found',
    };
  }

  const cardData = card.data as any;
  const meta = cardData.meta || {};

  return {
    title: meta.title || card.title || 'Digital Business Card',
    description: meta.description || 'View my digital business card',
    openGraph: {
      title: meta.title || card.title || 'Digital Business Card',
      description: meta.description || 'View my digital business card',
      images: meta.image ? [meta.image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title || card.title || 'Digital Business Card',
      description: meta.description || 'View my digital business card',
      images: meta.image ? [meta.image] : [],
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const resolvedParams = await params;
  const card = await prisma.card.findFirst({
    where: {
      slug: resolvedParams.slug,
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      data: true,
      selectedThemeId: true,
      brandingHidden: true,
      publicUrl: true,
      qrCodeUrl: true,
      createdAt: true,
    },
  });

  if (!card) {
    notFound();
  }

  // Track view (client-side in CardView component)
  
  return <CardView card={card} />;
}

// Enable ISR with 60 second revalidation
export const revalidate = 60;

// Uncomment when database is available
// Generate static params for popular cards (optional)
// export async function generateStaticParams() {
//   const cards = await prisma.card.findMany({
//     where: { isPublished: true },
//     select: { slug: true },
//     take: 100,
//     orderBy: { updatedAt: 'desc' },
//   });
//   return cards.map((card: any) => ({ slug: card.slug }));
// }
