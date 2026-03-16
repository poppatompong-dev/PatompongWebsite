import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/statistics - Get portfolio statistics
export async function GET(_request: NextRequest) {
  try {
    const stats = await prisma.projectStatistics.findFirst();
    const totalProjects = await prisma.project.count();
    const clientCount = await prisma.client.count();
    const categoryCount = await prisma.category.count();

    return NextResponse.json({
      success: true,
      data: { ...stats, totalProjects, clientCount, categoryCount },
    });
  } catch (error) {
    console.error("[GET /api/statistics]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 });
  }
}
