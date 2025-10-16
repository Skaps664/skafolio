/**
 * Publish Card API
 * POST /api/cards/[id]/publish - Publish card with slug and QR generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { publishCardSchema } from '@/lib/validations';
import { generatePublicCardUrl } from '@/lib/utils';
import { generateAndUploadQRCode } from '@/lib/qr';
import prisma from '@/lib/prisma';

export async function POST(
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
    });
    
    if (!existingCard) {
      return NextResponse.json(
        { error: 'Not found', message: 'Card not found' },
        { status: 404 }
      );
    }
    
    const body = await req.json();
    
    // Validate input
    const validation = publishCardSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { slug, metaTitle, metaDescription, metaImage } = validation.data;
    
    // Check slug uniqueness
    if (slug !== existingCard.slug) {
      const slugExists = await prisma.card.findUnique({
        where: { slug },
        select: { id: true },
      });
      
      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug taken', message: 'This slug is already in use. Please choose another.' },
          { status: 409 }
        );
      }
    }
    
    // Generate public URL
    const publicUrl = generatePublicCardUrl(slug);
    
    // Generate and upload QR code
    let qrCodeUrl = existingCard.qrCodeUrl;
    try {
      qrCodeUrl = await generateAndUploadQRCode(publicUrl, params.id);
    } catch (error) {
      console.error('QR generation error:', error);
      // Continue even if QR fails - can be regenerated later
    }
    
    // Update card
    const card = await prisma.card.update({
      where: { id: params.id },
      data: {
        slug,
        isPublished: true,
        publicUrl,
        qrCodeUrl,
        data: {
          ...(existingCard.data as object),
          meta: {
            title: metaTitle || existingCard.title || 'Digital Business Card',
            description: metaDescription || 'View my digital business card',
            image: metaImage || null,
          },
        },
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Card published successfully',
        card: {
          id: card.id,
          slug: card.slug,
          publicUrl: card.publicUrl,
          qrCodeUrl: card.qrCodeUrl,
          isPublished: card.isPublished,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Publish card error:', error);
    return NextResponse.json(
      { error: 'Failed to publish card', message: 'An error occurred during publishing' },
      { status: 500 }
    );
  }
}
