import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/clients - Get all clients
export async function GET(request: NextRequest) {
  try {
    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { clientName: "asc" },
    });

    return NextResponse.json({ success: true, data: clients });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
