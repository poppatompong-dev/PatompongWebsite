import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB raw input
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/tiff", "image/bmp", "image/heic"];

// ─────────────────────────────────────────────
// Production Studio Enhancement Parameters
// Matches the PORTFOLIO_SUMMARY.html spec exactly:
//  brightness +5%, contrast +8%, saturation +10%,
//  sharpen (unsharp mask r1.5 p120), vignette 25%
// ─────────────────────────────────────────────
async function processProductionStudio(inputBuffer: Buffer): Promise<Buffer> {
    // 1. Decode, auto-rotate (fix EXIF), resize to max 1920px
    let pipeline = sharp(inputBuffer)
        .rotate()                          // auto-transpose EXIF
        .resize(1920, 1920, {
            fit: "inside",
            withoutEnlargement: true,
        });

    // 2. Modulate: brightness +5%, saturation +10%
    pipeline = pipeline.modulate({
        brightness: 1.05,
        saturation: 1.10,
    });

    // 3. Auto-Contrast (approx 0.5% cutoff)
    pipeline = pipeline.normalize();

    // 4. Linear: contrast +8%
    pipeline = pipeline.linear(1.08, -(128 * 0.08));

    // 5. Sharpen (Unsharp Mask: sigma=1.5)
    pipeline = pipeline.sharpen({ sigma: 1.5 });

    // 6. Frame Border: 2px Light Grey
    pipeline = pipeline.extend({
        top: 2, bottom: 2, left: 2, right: 2,
        background: '#D3D3D3'
    });

    // Generate intermediate buffer to get dimensions for Vignette
    const { data: preprocessed, info } = await pipeline.toBuffer({ resolveWithObject: true });

    // 7. Vignette: 25% subtle edge via SVG overlay
    const vignetteSvg = `
      <svg width="${info.width}" height="${info.height}">
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stop-color="transparent" />
            <stop offset="100%" stop-color="rgba(0,0,0,0.25)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#vignette)" />
      </svg>`;

    // Output as Progressive JPEG quality 88%
    const finalBuffer = await sharp(preprocessed)
        .composite([{ input: Buffer.from(vignetteSvg), blend: "multiply" }])
        .jpeg({ quality: 88, progressive: true })
        .toBuffer();

    return finalBuffer;
}

export async function POST(request: NextRequest) {
    // Auth guard
    const sessionCookie = request.cookies.get("admin_session");
    if (!sessionCookie?.value) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const category = (formData.get("category") as string) || "Uncategorized";

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: `File too large (max 30MB)` }, { status: 400 });
        }

        const mimeType = file.type.toLowerCase();
        if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
            return NextResponse.json({ error: `Only images are allowed. Got: ${mimeType}` }, { status: 400 });
        }

        // Read raw bytes
        const bytes = await file.arrayBuffer();
        const inputBuffer = Buffer.from(bytes);

        // Process with Production Studio pipeline
        const processedBuffer = await processProductionStudio(inputBuffer);

        // Generate unique output filename (always .jpg)
        const timestamp = Date.now();
        const safeName = path.basename(file.name, path.extname(file.name))
            .replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, "_")
            .slice(0, 60);
        const outputFilename = `${safeName}_${timestamp}.jpg`;

        // Determine destination subfolder based on category
        const folderMap: Record<string, string> = {
            "CCTV & Security": "01_CCTV_Surveillance",
            "Network & Server": "02_Network_Server",
            "Wireless & Antenna": "03_Wireless_Antenna",
            "Fiber Optic": "04_Fiber_Optic_Cabling",
            "Broadcasting & AV": "05_Broadcasting_AV",
            "Field Operations": "06_Field_Operations",
            "Drone Survey": "07_Drone_Survey",
        };
        const subfolder = folderMap[category] || "uploads";
        const destDir = path.join(process.cwd(), "public", "portfolio", subfolder);
        await mkdir(destDir, { recursive: true });

        const destPath = path.join(destDir, outputFilename);
        const publicUrl = `/portfolio/${subfolder}/${outputFilename}`;

        // Save processed file
        await writeFile(destPath, processedBuffer);

        // Upsert into GalleryPhoto DB
        const id = `portfolio_${subfolder}_${outputFilename.replace(/[^a-zA-Z0-9]/g, "_")}`;
        await prisma.galleryPhoto.upsert({
            where: { id },
            update: { url: publicUrl, category },
            create: { id, url: publicUrl, category, isHidden: false },
        });

        // Get size info from Sharp metadata
        const metadata = await sharp(processedBuffer).metadata();

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: outputFilename,
            fileType: "image",
            fileSize: processedBuffer.length,
            width: metadata.width,
            height: metadata.height,
            format: "jpeg",
            dbId: id,
            enhancements: {
                resized: `max 1920px + 2px border`,
                format: "Progressive JPEG @ 88%",
                brightness: "+5%",
                contrast: "+8%",
                saturation: "+10%",
                sharpen: "Unsharp Mask 1.5",
                vignette: "25% radial",
            },
        });
    } catch (error) {
        console.error("[PORTFOLIO-UPLOAD ERROR]", error);
        return NextResponse.json({ error: "Upload processing failed" }, { status: 500 });
    }
}
