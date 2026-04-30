import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idwarga, namawarga, alamatwarga, norumah, nohp } = await request.json();

    if (!idwarga?.trim() || !namawarga?.trim()) {
      return NextResponse.json(
        { error: 'ID Warga dan Nama wajib diisi.' },
        { status: 400 }
      );
    }

    // Verify warga exists
    const [wargaRows] = await db.execute<any[]>(
      'SELECT idwarga FROM datawarga WHERE idwarga = $1',
      [idwarga.trim()]
    );

    if (wargaRows.length === 0) {
      return NextResponse.json(
        { error: 'Warga tidak ditemukan.' },
        { status: 404 }
      );
    }

    await db.execute(
      `UPDATE datawarga
       SET namawarga = $1, alamatwarga = $2, norumah = $3, nohp = $4
       WHERE idwarga = $5`,
      [
        namawarga.trim(),
        alamatwarga || 'Jl. Sendangsari Utara',
        norumah || '01',
        nohp || '08112345678',
        idwarga.trim()
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Warga berhasil diupdate'
    });
  } catch (error) {
    console.error('update-warga error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
