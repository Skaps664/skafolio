/**
 * Analytics Event Tracking API
 * POST /api/analytics/event - Track analytics events (view, click, qr_scan, share)
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyticsEventSchema } from '@/lib/validations';
import { hashIP } from '@/lib/utils';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = analyticsEventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { cardId, eventType, metadata } = validation.data;
    
    // Verify card exists
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { id: true, isPublished: true },
    });
    
    if (!card) {
      return NextResponse.json(
        { error: 'Card not found', message: 'Card not found' },
        { status: 404 }
      );
    }
    
    if (!card.isPublished) {
      return NextResponse.json(
        { error: 'Card not published', message: 'Cannot track analytics for unpublished cards' },
        { status: 400 }
      );
    }
    
    // Get IP address and hash it for privacy
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const ipHash = hashIP(ip);
    
    // Create analytics event
    await prisma.cardEvent.create({
      data: {
        cardId,
        eventType,
        metadata: metadata || {},
        ipHash,
        timestamp: new Date(),
      },
    });
    
    // Update cached analytics summary asynchronously (fire and forget)
    updateCardAnalyticsSummary(cardId).catch(err => 
      console.error('Failed to update analytics summary:', err)
    );
    
    return NextResponse.json(
      {
        success: true,
        message: 'Event tracked successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Track event error:', error);
    return NextResponse.json(
      { error: 'Failed to track event', message: 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Update cached analytics summary for a card
 */
async function updateCardAnalyticsSummary(cardId: string) {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Aggregate events
  const [total, last24hEvents, last7dEvents, last30dEvents] = await Promise.all([
    prisma.cardEvent.count({ where: { cardId } }),
    prisma.cardEvent.count({ where: { cardId, timestamp: { gte: last24h } } }),
    prisma.cardEvent.count({ where: { cardId, timestamp: { gte: last7d } } }),
    prisma.cardEvent.count({ where: { cardId, timestamp: { gte: last30d } } }),
  ]);
  
  // Count by event type
  const eventsByType = await prisma.cardEvent.groupBy({
    by: ['eventType'],
    where: { cardId },
    _count: true,
  });
  
  const summary = {
    total,
    last24h: last24hEvents,
    last7d: last7dEvents,
    last30d: last30dEvents,
    byType: eventsByType.reduce((acc: Record<string, number>, item: any) => {
      acc[item.eventType] = item._count;
      return acc;
    }, {} as Record<string, number>),
    lastUpdated: new Date(),
  };
  
  // Update card analytics cache
  await prisma.card.update({
    where: { id: cardId },
    data: { analytics: summary },
  });
}
