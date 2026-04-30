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

    const { idwarga, newPassword } = await request.json();

    const idwargaStr = String(idwarga).trim();
    if (!idwargaStr || !newPassword) {
      return NextResponse.json(
        { error: 'ID Warga dan password baru wajib diisi.' },
        { status: 400 }
      );
    }

    // Verify user exists in loginwarga
    const [userCheck] = await db.execute<any[]>(
      'SELECT idwarga FROM loginwarga WHERE idwarga = $1',
      [idwargaStr]
    );

    if (userCheck.length === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan.' },
        { status: 404 }
      );
    }

    const hash = await bcryptjs.hash(newPassword, 10);
    console.log('Updating password for idwarga:', idwargaStr, 'with hash:', hash.substring(0, 20) + '...');

    const result = await db.execute(
      'UPDATE loginwarga SET passwordlogin = $1 WHERE idwarga = $2',
      [hash, idwargaStr]
    );
    console.log('Update result:', result);

    return NextResponse.json({
      success: true,
      message: 'Password berhasil direset'
    });
  } catch (error) {
    console.error('reset-password-v2 error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
