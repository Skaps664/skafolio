/**
 * POST /api/auth/login
 * Login with email and password
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations';
import { verifyPassword } from '@/lib/password';
import { generateAccessToken, generateRefreshToken, createAccessTokenCookie, createRefreshTokenCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { email, password } = validation.data;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials', message: 'Email or password is incorrect' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials', message: 'Email or password is incorrect' },
        { status: 401 }
      );
    }
    
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
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
    
    response.headers.set('Set-Cookie', createAccessTokenCookie(accessToken));
    response.headers.append('Set-Cookie', createRefreshTokenCookie(refreshToken));
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
