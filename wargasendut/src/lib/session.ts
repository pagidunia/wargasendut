import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export type SessionData = {
  userId?: number;
  username?: string;
  displayName?: string;
  role?: string;
  isLoggedIn?: boolean;
};

export const sessionOptions = {
  password: process.env.SESSION_SECRET ?? 'wargasendut_secret_key_minimum_32_characters_long!!',
  cookieName: 'ws_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
}
