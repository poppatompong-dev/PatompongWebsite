import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/statistics - Get portfolio statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await prisma.projectStatistics.findFirst();
    const totalProjects = await prisma.project.count();
    const clientCount = await prisma.client.count();
    const categoryCount = await prisma.category.count();

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        totalProjects,
        clientCount,
        categoryCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
