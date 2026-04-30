import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

const DEFAULT_PASSWORD = 'sendut123';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hash = await bcryptjs.hash(DEFAULT_PASSWORD, 10);
    console.log('Resetting all passwords to default...');

    // Get all users before update
    const [beforeReset] = await db.execute<any[]>(
      'SELECT COUNT(*) as count FROM loginwarga'
    );
    const totalUsers = beforeReset[0]?.count || 0;
    console.log('Total users in loginwarga:', totalUsers);

    // Reset all passwords
    await db.execute(
      'UPDATE loginwarga SET passwordlogin = $1',
      [hash]
    );

    console.log('All passwords reset to default successfully');

    return NextResponse.json({
      success: true,
      message: `Password semua ${totalUsers} user berhasil direset ke: ${DEFAULT_PASSWORD}`,
      totalUsers,
      defaultPassword: DEFAULT_PASSWORD,
    });
  } catch (error) {
    console.error('reset-all-passwords error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
