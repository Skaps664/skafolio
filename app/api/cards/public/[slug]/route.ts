/**
 * Public Card View API
 * GET /api/cards/public/[slug] - Get published card by slug (public)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const card = await prisma.card.findFirst({
      where: {
        slug: params.slug,
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
        updatedAt: true,
      },
    });
    
    if (!card) {
      return NextResponse.json(
        { error: 'Not found', message: 'Card not found or not published' },
        { status: 404 }
      );
    }
    
    // Increment view count asynchronously (fire and forget)
    // This will be handled by analytics API
    
    return NextResponse.json(
      {
        success: true,
        card,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Get public card error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card', message: 'An error occurred' },
      { status: 500 }
    );
  }
}
