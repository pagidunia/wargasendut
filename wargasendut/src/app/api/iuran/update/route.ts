import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { iduran, bulan, tahun, jumlah, status } = await request.json();

    if (!iduran || !bulan || !tahun || !jumlah || !status) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi.' },
        { status: 400 }
      );
    }

    const tahunNum = parseInt(tahun);
    const jumlahNum = parseFloat(jumlah);

    const tanggalBayar = status === 'lunas' ? new Date().toISOString().split('T')[0] : null;

    await db.execute(
      'UPDATE iuranwarga SET bulan = $1, tahun = $2, jumlah = $3, status = $4, tanggal_bayar = $5 WHERE iduran = $6',
      [bulan, tahunNum, jumlahNum, status, tanggalBayar, iduran]
    );

    return NextResponse.json({
      success: true,
      message: 'Iuran berhasil diperbarui',
    });
  } catch (error) {
    console.error('iuran/update error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
