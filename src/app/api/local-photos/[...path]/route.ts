import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const urlPath = (await params).path;
    
    if (!urlPath || urlPath.length === 0) {
      return new NextResponse('File path is required', { status: 400 });
    }

    // Join the path array and decode URI components to get the actual file path relative to temp_photos
    const decodedPath = urlPath.map(p => decodeURIComponent(p)).join(path.sep);
    
    // Prevent directory traversal attacks
    const normalizedPath = path.normalize(decodedPath);
    if (normalizedPath.startsWith('..') || path.isAbsolute(normalizedPath)) {
       return new NextResponse('Forbidden', { status: 403 });
    }

    const filePath = path.join(process.cwd(), 'temp_photos', normalizedPath);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse('Image not found', { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    
    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
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
