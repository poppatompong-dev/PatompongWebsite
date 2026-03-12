import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const segments = (await params).path;

    if (!segments || segments.length === 0) {
      return new NextResponse('Path is required', { status: 400 });
    }

    // Sanitize each segment to prevent directory traversal
    const sanitized = segments.map((s) => path.basename(decodeURIComponent(s)));
    const filePath = path.join(process.cwd(), 'temp_photos', ...sanitized);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse('Image not found', { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);

    // Determine content type
    const ext = path.extname(sanitized[sanitized.length - 1]).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving local photo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
