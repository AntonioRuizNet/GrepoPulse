import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'gp_admin';

export function getJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error('Missing ADMIN_JWT_SECRET');
  return secret;
}

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signAdminToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyAdminToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export function setAdminSession({ user = 'admin' } = {}) {
  const token = signAdminToken({ user });
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminSession() {
  cookies().set({ name: COOKIE_NAME, value: '', path: '/', maxAge: 0 });
}

export function getAdminFromCookies() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
