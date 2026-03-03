import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Allowed MIME types and their extensions
const ALLOWED_TYPES: Record<string, string[]> = {
    // Images
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
    "image/svg+xml": [".svg"],
    // Documents
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "application/vnd.ms-powerpoint": [".ppt"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
    // Video
    "video/mp4": [".mp4"],
    "video/webm": [".webm"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
    // Auth is enforced by middleware.ts — double-check here for defense-in-depth
    const sessionCookie = request.cookies.get("admin_session");
    if (!sessionCookie?.value) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: "No valid file provided" }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` }, { status: 400 });
        }

        if (file.size === 0) {
            return NextResponse.json({ error: "Empty file" }, { status: 400 });
        }

        // Validate MIME type
        const mimeType = file.type;
        if (!ALLOWED_TYPES[mimeType]) {
            return NextResponse.json(
                { error: `File type not allowed: ${mimeType}. Allowed: images, PDF, Office documents, MP4/WebM.` },
                { status: 400 }
            );
        }

        // Validate extension matches MIME type
        const ext = path.extname(file.name).toLowerCase();
        const allowedExts = ALLOWED_TYPES[mimeType];
        if (!allowedExts.includes(ext)) {
            return NextResponse.json(
                { error: `File extension ${ext} does not match type ${mimeType}` },
                { status: 400 }
            );
        }

        // Sanitize filename — remove dangerous characters, limit length
        const safeName = path.basename(file.name, ext)
            .replace(/[^a-zA-Z0-9_\-\u0E00-\u0E7F]/g, "_") // Allow Thai + alphanumeric
            .slice(0, 100);
        const uniqueName = `${safeName}_${Date.now()}${ext}`;

        // Create uploads directory
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });

        // Write file
        const filePath = path.join(uploadsDir, uniqueName);

        // Ensure no path traversal in final path
        if (!filePath.startsWith(uploadsDir)) {
            return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));

        // Determine file type category
        let fileType = "document";
        if (mimeType.startsWith("image/")) fileType = "image";
        else if (mimeType.startsWith("video/")) fileType = "video";

        return NextResponse.json({
            success: true,
            url: `/uploads/${uniqueName}`,
            filename: file.name,
            fileType,
            fileSize: file.size,
        });
    } catch (error) {
        console.error("[UPLOAD ERROR]", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
