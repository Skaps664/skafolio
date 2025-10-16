/**
 * Card Detail & Update API
 * GET /api/cards/[id] - Get card by ID (protected)
 * PUT /api/cards/[id] - Update card (protected)
 * DELETE /api/cards/[id] - Delete card (protected)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { updateCardSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const card = await prisma.card.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });
    
    if (!card) {
      return NextResponse.json(
        { error: 'Not found', message: 'Card not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        card,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get card error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card', message: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check card ownership
    const existingCard = await prisma.card.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
      select: { id: true },
    });
    
    if (!existingCard) {
      return NextResponse.json(
        { error: 'Not found', message: 'Card not found' },
        { status: 404 }
      );
    }
    
    const body = await req.json();
    
    // Validate input
    const validation = updateCardSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { title, data } = validation.data;
    
    // Update card
    const card = await prisma.card.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(data && { data }),
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Card updated successfully',
        card,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update card error:', error);
    return NextResponse.json(
      { error: 'Failed to update card', message: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check card ownership
    const existingCard = await prisma.card.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
      select: { id: true },
    });
    
    if (!existingCard) {
      return NextResponse.json(
        { error: 'Not found', message: 'Card not found' },
        { status: 404 }
      );
    }
    
    // Delete card
    await prisma.card.delete({
      where: { id: params.id },
    });
    
    // Remove from user's cardIds
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        cardIds: {
          set: (await prisma.user.findUnique({
            where: { id: user.userId },
            select: { cardIds: true },
          }))?.cardIds.filter((id: string) => id !== params.id) || [],
        },
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Card deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete card error:', error);
    return NextResponse.json(
      { error: 'Failed to delete card', message: 'An error occurred' },
      { status: 500 }
    );
  }
}
