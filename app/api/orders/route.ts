/**
 * Orders API
 * GET /api/orders - List user's orders
 * POST /api/orders - Create new order
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createOrderSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const orders = await prisma.order.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(
      {
        success: true,
        orders,
        total: orders.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('List orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', message: 'An error occurred' },
      { status: 500 }
    );
  }
}

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
    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { cardId, productType, quantity, material, customDesign, paymentMethod, shippingInfo } = validation.data;
    
    // Verify card ownership if cardId provided
    if (cardId) {
      const card = await prisma.card.findFirst({
        where: {
          id: cardId,
          userId: user.userId,
        },
        select: { id: true },
      });
      
      if (!card) {
        return NextResponse.json(
          { error: 'Card not found', message: 'Card not found or access denied' },
          { status: 404 }
        );
      }
    }
    
    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        cardId,
        productType,
        quantity,
        material,
        customDesign,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
        shippingInfo,
        status: 'pending',
      },
    });
    
    // Update user's orderIds
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        orderIds: {
          push: order.id,
        },
      },
    });
    
    // If COD, mark order as confirmed
    if (paymentMethod === 'COD') {
      return NextResponse.json(
        {
          success: true,
          message: 'Order created successfully (Cash on Delivery)',
          order,
          requiresPayment: false,
        },
        { status: 201 }
      );
    }
    
    // For PayFast, return order and indicate payment required
    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        order,
        requiresPayment: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', message: 'An error occurred' },
      { status: 500 }
    );
  }
}
