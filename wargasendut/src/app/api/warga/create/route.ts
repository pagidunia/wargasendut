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

    const { nama, alamatRumah, nomorRumah, noHp } = await request.json();

    if (!nama?.trim()) {
      return NextResponse.json(
        { error: 'Nama wajib diisi.' },
        { status: 400 }
      );
    }

    // Get max ID to generate next one
    const [maxIdRow] = await db.execute<any[]>(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(idwarga, 2) AS INTEGER)), 0) as max_num FROM datawarga`
    );
    const maxNum = maxIdRow[0]?.max_num || 0;
    const nextNum = maxNum + 1;
    const newId = 'S' + String(nextNum).padStart(3, '0');

    // Hash default password
    const defaultPasswordHash = await bcryptjs.hash('sendut123', 10);

    // Insert ke datawarga
    const [result] = await db.execute<any[]>(
      `INSERT INTO datawarga (idwarga, namawarga, alamatwarga, norumah, nohp)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING idwarga, namawarga`,
      [
        newId,
        nama.trim(),
        alamatRumah || 'Jl. Sendangsari Utara',
        nomorRumah || '01',
        noHp || '08112345678'
      ]
    );

    // Insert ke loginwarga dengan idwarga yang sama
    await db.execute(
      `INSERT INTO loginwarga (idwarga, namalogin, passwordlogin, rolelogin)
       VALUES ($1, $2, $3, $4)`,
      [newId, nama.trim(), defaultPasswordHash, 'Warga']
    );

    return NextResponse.json({
      success: true,
      warga: result[0],
      message: 'Warga berhasil ditambahkan'
    });
  } catch (error) {
    console.error('create-warga error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
