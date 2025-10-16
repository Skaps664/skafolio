/**
 * Slug Check API
 * GET /api/cards/slug-check?slug=xxx - Check if slug is available
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug required', message: 'Slug parameter is required' },
        { status: 400 }
      );
    }
    
    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          available: false,
          message: 'Slug can only contain lowercase letters, numbers, and hyphens',
        },
        { status: 200 }
      );
    }
    
    if (slug.length < 3) {
      return NextResponse.json(
        {
          available: false,
          message: 'Slug must be at least 3 characters',
        },
        { status: 200 }
      );
    }
    
    if (slug.length > 50) {
      return NextResponse.json(
        {
          available: false,
          message: 'Slug must be less than 50 characters',
        },
        { status: 200 }
      );
    }
    
    // Check if slug exists
    const exists = await prisma.card.findUnique({
      where: { slug },
      select: { id: true },
    });
    
    return NextResponse.json(
      {
        available: !exists,
        message: exists ? 'This slug is already taken' : 'Slug is available',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Slug check error:', error);
    return NextResponse.json(
      { error: 'Failed to check slug', message: 'An error occurred' },
      { status: 500 }
    );
  }
}
