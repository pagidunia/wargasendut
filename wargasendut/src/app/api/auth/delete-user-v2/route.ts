import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idwarga } = await request.json();

    if (!idwarga?.trim()) {
      return NextResponse.json(
        { error: 'ID Warga wajib diisi.' },
        { status: 400 }
      );
    }

    const [result] = await db.execute<any[]>(
      'DELETE FROM loginwarga WHERE idwarga = $1 RETURNING idwarga',
      [idwarga.trim()]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus'
    });
  } catch (error) {
    console.error('delete-user-v2 error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
