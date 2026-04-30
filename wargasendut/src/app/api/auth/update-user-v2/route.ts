import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idwarga, namalogin, rolelogin } = await request.json();

    if (!idwarga?.trim() || !namalogin?.trim()) {
      return NextResponse.json(
        { error: 'ID Warga dan nama login wajib diisi.' },
        { status: 400 }
      );
    }

    // Verify user exists
    const [userRows] = await db.execute<any[]>(
      'SELECT idwarga FROM loginwarga WHERE idwarga = $1',
      [idwarga.trim()]
    );

    if (userRows.length === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan.' },
        { status: 404 }
      );
    }

    await db.execute(
      `UPDATE loginwarga
       SET namalogin = $1, rolelogin = $2
       WHERE idwarga = $3`,
      [namalogin.trim(), rolelogin || 'Warga', idwarga.trim()]
    );

    return NextResponse.json({
      success: true,
      message: 'User berhasil diupdate'
    });
  } catch (error) {
    console.error('update-user-v2 error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
