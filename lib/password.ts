/**
 * Password Hashing Utilities
 * Fast bcrypt hashing with optimal rounds for performance/security balance
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // Good balance between security and speed

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
