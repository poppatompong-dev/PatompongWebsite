import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/search - Search projects
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
      return NextResponse.json(
        { success: false, error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { projectName: { contains: q } },
          { description: { contains: q } },
          { tags: { contains: q } },
          { keywords: { contains: q } },
        ],
      },
      include: {
        client: true,
        category: true,
      },
      take: 20,
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
