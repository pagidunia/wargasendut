import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    console.log('check-username input:', { username });

    if (!username?.trim()) {
      return NextResponse.json(
        { error: 'Username wajib diisi.' },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    console.log('searching for:', trimmedUsername);

    const [rows] = await db.execute<any[]>(
      'SELECT idwarga, namalogin FROM loginwarga WHERE LOWER(namalogin) = LOWER($1)',
      [trimmedUsername]
    );

    console.log('loginwarga query result:', rows);

    if (rows.length === 0) {
      // Debug: get all users to see what's in the table
      const [allUsers] = await db.execute<any[]>(
        'SELECT idwarga, namalogin FROM loginwarga LIMIT 5'
      );
      console.log('All loginwarga users sample:', allUsers);

      return NextResponse.json(
        { error: 'Username tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Get display name from datawarga
    const [wargaRows] = await db.execute<any[]>(
      'SELECT namawarga FROM datawarga WHERE idwarga = $1',
      [rows[0].idwarga]
    );

    const displayName = wargaRows.length > 0 ? wargaRows[0].namawarga : rows[0].namalogin;

    return NextResponse.json({
      success: true,
      displayName,
    });
  } catch (error) {
    console.error('check-username error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
