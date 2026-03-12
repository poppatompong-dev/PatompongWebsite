import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/projects - Get all projects with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");
    const categoryId = searchParams.get("categoryId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build where clause
    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.project.count({ where });

    // Get projects with pagination
    const projects = await prisma.project.findMany({
      where,
      include: {
        client: true,
        category: true,
      },
      skip,
      take: limit,
      orderBy: { projectNumber: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const project = await prisma.project.create({
      data: {
        projectId: body.projectId,
        projectNumber: body.projectNumber,
        projectName: body.projectName,
        slug: body.slug,
        clientId: body.clientId,
        type: body.type,
        categoryId: body.categoryId,
        subcategory: body.subcategory,
        url: body.url,
        description: body.description,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        keywords: body.keywords ? JSON.stringify(body.keywords) : null,
        status: body.status || "completed",
        startDate: body.startDate ? new Date(body.startDate) : null,
        completedDate: body.completedDate ? new Date(body.completedDate) : null,
      },
      include: {
        client: true,
        category: true,
      },
    });

    return NextResponse.json(
      { success: true, data: project },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
