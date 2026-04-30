import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idwarga, namalogin, passwordlogin, role } = await request.json();

    if (!idwarga?.trim() || !namalogin?.trim() || !passwordlogin) {
      return NextResponse.json(
        { error: 'ID Warga, nama login, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    // Verify idwarga exists in datawarga
    const [wargaCheck] = await db.execute<any[]>(
      'SELECT idwarga FROM datawarga WHERE idwarga = $1',
      [idwarga.trim()]
    );

    if (wargaCheck.length === 0) {
      return NextResponse.json(
        { error: 'ID Warga tidak ditemukan di datawarga.' },
        { status: 400 }
      );
    }

    const hash = await bcryptjs.hash(passwordlogin, 10);

    const [result] = await db.execute<any[]>(
      `INSERT INTO loginwarga (idwarga, namalogin, passwordlogin, role)
       VALUES ($1, $2, $3, $4)
       RETURNING idwarga, namalogin`,
      [idwarga.trim(), namalogin.trim(), hash, role || 'Warga']
    );

    return NextResponse.json({
      success: true,
      user: result[0],
      message: 'User login berhasil dibuat'
    });
  } catch (error: any) {
    console.error('create-user-v2 error:', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'ID Warga sudah terdaftar.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
