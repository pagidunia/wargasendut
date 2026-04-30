import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';

const TEST_PASSWORD = 'warga123';
const TEST_HASH = '$2a$10$b56uRbMSJa64wgYgUuVjWepx1DSTHf/PcNhP/352rH9sMF1.9Lfb.';

export async function GET(request: NextRequest) {
  try {
    const result = await bcryptjs.compare(TEST_PASSWORD, TEST_HASH);

    return NextResponse.json({
      password: TEST_PASSWORD,
      hash: TEST_HASH,
      match: result,
      message: result ? '✓ Password match!' : '✗ Password mismatch'
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
