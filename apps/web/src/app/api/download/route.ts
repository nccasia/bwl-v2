import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    // Extract filename from URL or use a default
    const filename = url.split('/').pop()?.split(/[?#]/)[0] || 'image.jpg';
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
