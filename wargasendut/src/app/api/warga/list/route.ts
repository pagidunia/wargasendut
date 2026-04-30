import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [wargaRows] = await db.execute<any[]>(
      `SELECT idwarga, namawarga, alamatwarga, norumah, nohp
       FROM datawarga
       ORDER BY idwarga`
    );

    return NextResponse.json({
      warga: wargaRows.map((row: any) => ({
        id: row.idwarga,
        idwarga: row.idwarga,
        display_name: row.namawarga,
        namawarga: row.namawarga,
        alamat_rumah: row.alamatwarga,
        alamatwarga: row.alamatwarga,
        nomor_rumah: row.norumah,
        norumah: row.norumah,
        no_hp: row.nohp,
        nohp: row.nohp,
      }))
    });
  } catch (error) {
    console.error('warga list error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
