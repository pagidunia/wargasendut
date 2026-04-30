import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [result] = await db.execute('SELECT 1 as test');
    return NextResponse.json({
      success: true,
      message: 'Database connection OK',
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
