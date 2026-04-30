import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First try: find idwarga from loginwarga using username
    const [loginRows] = await db.execute<any[]>(
      `SELECT idwarga FROM loginwarga WHERE namalogin = $1`,
      [session.username]
    );

    let idwarga = loginRows.length > 0 ? loginRows[0].idwarga : null;

    // Second try: if not found in loginwarga, use userId as idwarga
    if (!idwarga) {
      idwarga = session.userId;
    }

    // Get user data from datawarga
    const [userRows] = await db.execute<any[]>(
      `SELECT idwarga, namawarga, alamatwarga, norumah, nohp FROM datawarga WHERE idwarga = $1`,
      [idwarga]
    );

    if (userRows.length === 0) {
      return NextResponse.json(
        { error: 'Data tidak ditemukan.' },
        { status: 404 }
      );
    }

    const user = userRows[0];
    return NextResponse.json({
      displayName: session.displayName,
      userRole: session.role,
      idwarga: user.idwarga,
      namawarga: user.namawarga,
      alamatwarga: user.alamatwarga,
      norumah: user.norumah,
      nohp: user.nohp,
    });
  } catch (error) {
    console.error('user-profile error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
