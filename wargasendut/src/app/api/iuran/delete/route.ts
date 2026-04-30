import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { iduran } = await request.json();

    if (!iduran) {
      return NextResponse.json(
        { error: 'ID iuran wajib diisi.' },
        { status: 400 }
      );
    }

    await db.execute(
      'DELETE FROM iuranwarga WHERE iduran = $1',
      [iduran]
    );

    return NextResponse.json({
      success: true,
      message: 'Iuran berhasil dihapus',
    });
  } catch (error) {
    console.error('iuran/delete error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
