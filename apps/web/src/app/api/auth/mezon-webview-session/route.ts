import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'mezon_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      accessToken: string;
      userId: string;
      email?: string;
      userName?: string;
      displayName?: string;
      avatar?: string;
      expiresAt?: string;
    };

    if (!body.accessToken || !body.userId) {
      return NextResponse.json({ message: 'Missing accessToken or userId' }, { status: 400 });
    }

    const payload = JSON.stringify({
      accessToken: body.accessToken,
      userId: body.userId,
      email: body.email ?? '',
      userName: body.userName ?? '',
      displayName: body.displayName ?? '',
      avatar: body.avatar ?? '',
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, payload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true }, { status: 200 });
}
