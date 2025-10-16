/**
 * POST /api/auth/register
 * Register a new user with email and password
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations';
import { hashPassword } from '@/lib/password';
import { generateAccessToken, generateRefreshToken, createAccessTokenCookie, createRefreshTokenCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { email, password, phone } = validation.data;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists', message: 'An account with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        phone,
        role: 'user',
        subscriptionStatus: 'free',
      },
      select: {
        id: true,
        email: true,
        role: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });
    
    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    
    // Create response with cookies
    const response = NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
    
    response.headers.set('Set-Cookie', createAccessTokenCookie(accessToken));
    response.headers.append('Set-Cookie', createRefreshTokenCookie(refreshToken));
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
