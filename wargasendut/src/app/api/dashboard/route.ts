import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    console.log('Dashboard - Session:', { userId: session.userId, displayName: session.displayName });

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const now = new Date();
    const bulan = monthNames[now.getMonth()];
    const tahun = now.getFullYear();

    const [iuranRows] = await db.execute<any[]>(
      `SELECT i.idwarga, i.namawarga, d.alamatwarga, d.norumah, d.nohp, i.status, i.jumlah
       FROM iuranwarga i
       LEFT JOIN datawarga d ON i.idwarga = d.idwarga
       WHERE i.tahun = $1 AND i.bulan = $2
       ORDER BY i.namawarga`,
      [tahun, bulan]
    );

    const totalLunas = iuranRows.filter((r: any) => r.status === 'lunas').length;
    const totalBelum = iuranRows.filter((r: any) => r.status === 'belum').length;
    const totalTerkumpul = iuranRows
      .filter((r: any) => r.status === 'lunas')
      .reduce((sum: number, r: any) => sum + (Number(r.jumlah) || 0), 0);
    const totalWarga = iuranRows.length;

    return NextResponse.json({
      displayName: session.displayName,
      userRole: session.role,
      bulan,
      tahun,
      stats: {
        terkumpul: totalTerkumpul,
        terbayar: totalLunas,
        tertunggak: totalBelum,
        totalWarga: totalWarga,
      },
      warga: iuranRows.map((row: any) => ({
        idwarga: row.idwarga,
        namawarga: row.namawarga,
        alamatwarga: row.alamatwarga,
        norumah: row.norumah,
        nohp: row.nohp,
        status: row.status,
        jumlah: row.jumlah,
      })),
    });
  } catch (error) {
    console.error('dashboard error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
