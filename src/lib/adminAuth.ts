import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

try {
  dotenv.config();
} catch (_) {}

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || 'fallback_session_secret_nexus_2026';
}

function getAdminPassword(): string {
  return (process.env.ADMIN_PASSWORD || 'Nexus2026').trim();
}

export interface AdminPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  adminPayload?: AdminPayload;
}

/**
 * Verifies admin password against process.env.ADMIN_PASSWORD
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  const configuredPassword = getAdminPassword();
  return password.trim() === configuredPassword;
}

/**
 * Generates signed JWT session token for Admin
 */
export function generateAdminSessionToken(): string {
  return jwt.sign(
    { role: 'admin', timestamp: Date.now() },
    getSessionSecret(),
    { expiresIn: '24h' }
  );
}

/**
 * Verifies JWT session token
 */
export function verifyAdminSessionToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, getSessionSecret()) as AdminPayload;
    if (decoded && decoded.role === 'admin') {
      return decoded;
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Express middleware to enforce admin session authentication
 */
export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Check authorization header or cookie
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.nexus_admin_session) {
    token = req.cookies.nexus_admin_session;
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication required.' });
    return;
  }

  const payload = verifyAdminSessionToken(token);
  if (!payload) {
    res.status(403).json({ success: false, error: 'Forbidden: Invalid or expired admin session token.' });
    return;
  }

  req.adminPayload = payload;
  next();
}
