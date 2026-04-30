import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [users] = await db.execute<any[]>(
      `SELECT idwarga, namalogin, rolelogin FROM loginwarga ORDER BY idwarga`
    );

    return NextResponse.json({
      success: true,
      users: users || []
    });
  } catch (error) {
    console.error('list-users error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
