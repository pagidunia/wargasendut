import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wargaid, namawarga, bulan, tahun, jumlah, status } = await request.json();

    if (!wargaid?.toString().trim() || !namawarga?.toString().trim() || !bulan || !tahun || !jumlah || !status) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi.' },
        { status: 400 }
      );
    }

    const wargaidStr = String(wargaid).trim();
    const namawargaStr = String(namawarga).trim();
    const tahunNum = parseInt(tahun);
    const jumlahNum = parseFloat(jumlah);

    // Verify warga exists in datawarga
    const [wargaCheck] = await db.execute<any[]>(
      'SELECT idwarga FROM datawarga WHERE idwarga = $1',
      [wargaidStr]
    );

    if (wargaCheck.length === 0) {
      return NextResponse.json(
        { error: 'Warga dengan ID tersebut tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Check if iuran already exists for this warga, bulan, tahun
    const [existingIuran] = await db.execute<any[]>(
      'SELECT idwarga FROM iuranwarga WHERE namawarga = $1 AND bulan = $2 AND tahun = $3',
      [namawargaStr, bulan, tahunNum]
    );

    if (existingIuran.length > 0) {
      return NextResponse.json(
        { error: 'Iuran untuk warga, bulan, dan tahun ini sudah ada.' },
        { status: 409 }
      );
    }

    // Set tanggal_bayar if status is 'lunas'
    const tanggalBayar = status === 'lunas' ? new Date().toISOString().split('T')[0] : null;

    // Insert iuran
    await db.execute(
      'INSERT INTO iuranwarga (idwarga, namawarga, bulan, tahun, jumlah, status, tanggal_bayar) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [wargaidStr, namawargaStr, bulan, tahunNum, jumlahNum, status, tanggalBayar]
    );

    return NextResponse.json({
      success: true,
      message: 'Iuran berhasil ditambahkan',
    });
  } catch (error) {
    console.error('iuran/create error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
