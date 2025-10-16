/**
 * Create PayFast Payment API
 * POST /api/payfast/create - Create PayFast payment URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createPayFastPayment } from '@/lib/payfast';
import prisma from '@/lib/prisma';

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
    const { orderId } = body;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required', message: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.userId,
      },
    });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found', message: 'Order not found or access denied' },
        { status: 404 }
      );
    }
    
    if (order.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Already paid', message: 'This order has already been paid' },
        { status: 400 }
      );
    }
    
    // Calculate amount (example pricing)
    let amount = 0;
    switch (order.productType) {
      case 'NFC_CARD':
        amount = order.material === 'metal' ? 500 : 250; // PKR
        break;
      case 'QR_STICKER':
        amount = 50;
        break;
      case 'SUBSCRIPTION':
        amount = 999;
        break;
      case 'REMAP':
        amount = 100;
        break;
    }
    amount *= order.quantity;
    
    // Get user data
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { email: true, phone: true },
    });
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.userId,
        orderId: order.id,
        amount,
        currency: 'PKR',
        gateway: 'PAYFAST',
        status: 'pending',
      },
    });
    
    // Create PayFast payment URL
    const paymentData = createPayFastPayment({
      orderId: order.id,
      amount,
      itemName: `${order.productType} x ${order.quantity}`,
      itemDescription: `Order #${order.id}`,
      userEmail: userData?.email || user.email,
      userPhone: userData?.phone || undefined,
      customData: {
        str1: user.userId,
        str2: order.id,
        str3: payment.id,
      },
    });
    
    // Update payment with gateway ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayId: paymentData.signature,
        metadata: paymentData.data,
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Payment URL created',
        paymentUrl: paymentData.url,
        paymentId: payment.id,
        amount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create PayFast payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment', message: 'An error occurred' },
      { status: 500 }
    );
  }
}
