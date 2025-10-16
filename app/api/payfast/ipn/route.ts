/**
 * PayFast IPN (Instant Payment Notification) Webhook Handler
 * POST /api/payfast/ipn - Handle PayFast payment notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { validatePayFastIPN, PayFastIPNData } from '@/lib/payfast';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Parse form data from PayFast
    const formData = await req.formData();
    const data: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });
    
    console.log('PayFast IPN received:', data);
    
    // Validate IPN
    const isValid = await validatePayFastIPN(data);
    
    if (!isValid) {
      console.error('PayFast IPN validation failed');
      return NextResponse.json(
        { error: 'Invalid IPN', message: 'IPN validation failed' },
        { status: 400 }
      );
    }
    
    const ipnData = data as unknown as PayFastIPNData;
    
    // Extract order and payment IDs from custom fields
    const orderId = ipnData.custom_str2;
    const paymentId = ipnData.custom_str3;
    
    if (!orderId || !paymentId) {
      console.error('Missing order or payment ID in IPN');
      return NextResponse.json(
        { error: 'Invalid IPN data', message: 'Missing required identifiers' },
        { status: 400 }
      );
    }
    
    // Fetch payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    
    if (!payment) {
      console.error('Payment not found:', paymentId);
      return NextResponse.json(
        { error: 'Payment not found', message: 'Payment record not found' },
        { status: 404 }
      );
    }
    
    // Verify amount matches
    const amountGross = parseFloat(ipnData.amount_gross);
    if (Math.abs(amountGross - payment.amount) > 0.01) {
      console.error('Amount mismatch:', amountGross, payment.amount);
      return NextResponse.json(
        { error: 'Amount mismatch', message: 'Payment amount does not match' },
        { status: 400 }
      );
    }
    
    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: ipnData.payment_status === 'COMPLETE' ? 'paid' : 'failed',
        gatewayId: ipnData.pf_payment_id,
        metadata: ipnData as any,
      },
    });
    
    // Update order status if payment successful
    if (ipnData.payment_status === 'COMPLETE') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          status: 'processing',
          updatedAt: new Date(),
        },
      });
      
      // TODO: Send confirmation email
      // TODO: Trigger order fulfillment process
      
      console.log('Payment successful for order:', orderId);
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'failed',
          updatedAt: new Date(),
        },
      });
      
      console.log('Payment failed for order:', orderId);
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'IPN processed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PayFast IPN error:', error);
    return NextResponse.json(
      { error: 'IPN processing failed', message: 'An error occurred' },
      { status: 500 }
    );
  }
}

// Disable body parsing for this route (Next.js will handle form data)
export const config = {
  api: {
    bodyParser: false,
  },
};
