/**
 * Card API Routes
 * GET /api/cards - List user's cards (protected)
 * POST /api/cards - Create new card (protected)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createCardSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import prisma from '@/lib/prisma';

/**
 * GET - List user's cards
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Fetch cards with optimized query
    const cards = await prisma.card.findMany({
      where: { userId: user.userId },
      select: {
        id: true,
        slug: true,
        title: true,
        isPublished: true,
        publicUrl: true,
        qrCodeUrl: true,
        brandingHidden: true,
        createdAt: true,
        updatedAt: true,
        analytics: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    return NextResponse.json(
      {
        success: true,
        cards,
        total: cards.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('List cards error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards', message: 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new card
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate input
    const validation = createCardSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { title, data } = validation.data;
    
    // Generate initial slug
    const baseSlug = title ? generateSlug(title) : `card-${Date.now()}`;
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await prisma.card.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // Create card
    const card = await prisma.card.create({
      data: {
        userId: user.userId,
        slug,
        title: title || 'Untitled Card',
        data: data || {},
        isPublished: false,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        data: true,
        isPublished: true,
        createdAt: true,
      },
    });
    
    // Update user's cardIds
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        cardIds: {
          push: card.id,
        },
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Card created successfully',
        card,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create card error:', error);
    return NextResponse.json(
      { error: 'Failed to create card', message: 'An error occurred' },
      { status: 500 }
    );
  }
}
