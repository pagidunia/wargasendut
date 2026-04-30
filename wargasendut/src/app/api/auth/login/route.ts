import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username?.trim() || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    // Check for lockout
    const [attemptRows] = await db.execute<any[]>(
      `SELECT COUNT(*) as cnt FROM login_attempts
       WHERE username = $1 AND success = 0
       AND created_at > NOW() - INTERVAL '1 minute' * $2`,
      [username, LOCKOUT_MINUTES]
    );

    const attempts = Number(attemptRows[0]?.cnt ?? 0);

    if (attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          error: `Akun terkunci. Coba lagi dalam ${LOCKOUT_MINUTES} menit.`,
          locked: true,
        },
        { status: 429 }
      );
    }

    // Get user from loginwarga
    const [userRows] = await db.execute<any[]>(
      'SELECT idwarga, namalogin, passwordlogin, rolelogin FROM loginwarga WHERE LOWER(namalogin) = LOWER($1)',
      [username.trim()]
    );

    if (userRows.length === 0) {
      return NextResponse.json(
        { error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    const user = userRows[0] as any;
    const valid = await bcryptjs.compare(password, user.passwordlogin);

    // Record attempt
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('cf-connecting-ip') ?? 'unknown';
    await db.execute(
      'INSERT INTO login_attempts (username, ip_address, success) VALUES ($1, $2, $3)',
      [username, ip, valid ? 1 : 0]
    );

    if (!valid) {
      const remaining = MAX_ATTEMPTS - (attempts + 1);
      return NextResponse.json(
        {
          error: `Sandi salah. Percobaan ${attempts + 1} dari ${MAX_ATTEMPTS}.`,
          remaining,
          attempts: attempts + 1,
        },
        { status: 401 }
      );
    }

    // Get display name from datawarga
    const [wargaRows] = await db.execute<any[]>(
      'SELECT namawarga FROM datawarga WHERE idwarga = $1',
      [user.idwarga]
    );

    const displayName = wargaRows.length > 0 ? wargaRows[0].namawarga : user.namalogin;

    // Create session
    const session = await getSession();
    session.userId = user.idwarga;
    session.username = user.namalogin;
    session.displayName = displayName;
    session.role = user.rolelogin;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      displayName: displayName,
    });
  } catch (error) {
    console.error('login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
