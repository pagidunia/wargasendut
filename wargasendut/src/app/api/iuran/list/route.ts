import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

interface IuranItem {
  iduran: number;
  idwarga: string;
  namawarga: string;
  norumah: string;
  bulan: string;
  tahun: number;
  jumlah: string;
  status: string;
  tanggal_bayar: string | null;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const now = new Date();
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = now.getFullYear();

    const [iuranRows] = await db.execute<any[]>(
      `SELECT
        i.iduran,
        i.idwarga,
        d.namawarga,
        d.norumah,
        i.bulan,
        i.tahun,
        i.jumlah,
        i.status,
        i.tanggal_bayar
       FROM iuranwarga i
       LEFT JOIN datawarga d ON i.idwarga = d.idwarga
       ORDER BY d.namawarga ASC, i.tahun DESC, i.bulan DESC`
    );

    return NextResponse.json({
      displayName: session.displayName,
      userRole: session.role,
      currentMonth,
      currentYear,
      iuran: iuranRows.map((row: any) => ({
        iduran: row.iduran,
        idwarga: row.idwarga,
        namawarga: row.namawarga || 'Unknown',
        norumah: row.norumah || '-',
        bulan: row.bulan,
        tahun: row.tahun,
        jumlah: row.jumlah,
        status: row.status || 'belum',
        tanggal_bayar: row.tanggal_bayar,
      })),
    });
  } catch (error) {
    console.error('iuran/list error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
