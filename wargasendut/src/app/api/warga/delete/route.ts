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

    // Delete from loginwarga first (child table)
    await db.execute(
      'DELETE FROM loginwarga WHERE idwarga = $1',
      [idwarga.trim()]
    );

    // Then delete from datawarga (parent table)
    const [result] = await db.execute<any[]>(
      'DELETE FROM datawarga WHERE idwarga = $1 RETURNING idwarga, namawarga',
      [idwarga.trim()]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Warga tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Warga berhasil dihapus'
    });
  } catch (error) {
    console.error('delete-warga error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
