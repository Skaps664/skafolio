/**
 * Get Analytics Summary for Card
 * GET /api/analytics/card/[cardId]/summary - Get aggregated analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify card ownership
    const card = await prisma.card.findFirst({
      where: {
        id: params.cardId,
        userId: user.userId,
      },
      select: {
        id: true,
        analytics: true,
      },
    });
    
    if (!card) {
      return NextResponse.json(
        { error: 'Card not found', message: 'Card not found or access denied' },
        { status: 404 }
      );
    }
    
    // Return cached analytics if available and recent
    if (card.analytics) {
      const analytics = card.analytics as any;
      const lastUpdated = new Date(analytics.lastUpdated);
      const now = new Date();
      const minutesSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);
      
      // Cache is valid for 5 minutes
      if (minutesSinceUpdate < 5) {
        return NextResponse.json(
          {
            success: true,
            analytics,
            cached: true,
          },
          { status: 200 }
        );
      }
    }
    
    // Compute fresh analytics
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const [total, last24hEvents, last7dEvents, last30dEvents, eventsByType] = await Promise.all([
      prisma.cardEvent.count({ where: { cardId: params.cardId } }),
      prisma.cardEvent.count({ where: { cardId: params.cardId, timestamp: { gte: last24h } } }),
      prisma.cardEvent.count({ where: { cardId: params.cardId, timestamp: { gte: last7d } } }),
      prisma.cardEvent.count({ where: { cardId: params.cardId, timestamp: { gte: last30d } } }),
      prisma.cardEvent.groupBy({
        by: ['eventType'],
        where: { cardId: params.cardId },
        _count: true,
      }),
    ]);
    
    const summary = {
      total,
      last24h: last24hEvents,
      last7d: last7dEvents,
      last30d: last30dEvents,
      byType: eventsByType.reduce((acc: Record<string, number>, item: any) => {
        acc[item.eventType] = item._count;
        return acc;
      }, {} as Record<string, number>),
      lastUpdated: now,
    };
    
    // Update cached analytics
    await prisma.card.update({
      where: { id: params.cardId },
      data: { analytics: summary },
    });
    
    return NextResponse.json(
      {
        success: true,
        analytics: summary,
        cached: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', message: 'An error occurred' },
      { status: 500 }
    );
  }
}
