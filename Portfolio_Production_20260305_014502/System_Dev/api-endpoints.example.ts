// Next.js API Endpoints Examples
// Location: app/api/projects/route.ts

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

// GET /api/projects/[id] - Get single project
export async function GET_BY_ID(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({
      where: { projectId: params.id },
      include: {
        client: true,
        category: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    const project = await prisma.project.update({
      where: { projectId: params.id },
      data: {
        projectName: body.projectName,
        description: body.description,
        url: body.url,
        status: body.status,
        tags: body.tags ? JSON.stringify(body.tags) : undefined,
        keywords: body.keywords ? JSON.stringify(body.keywords) : undefined,
        completedDate: body.completedDate ? new Date(body.completedDate) : undefined,
      },
      include: {
        client: true,
        category: true,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.project.delete({
      where: { projectId: params.id },
    });

    return NextResponse.json({ success: true, message: "Project deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}

// GET /api/clients - Get all clients
export async function GET_CLIENTS(request: NextRequest) {
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

// GET /api/categories - Get all categories
export async function GET_CATEGORIES(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET /api/statistics - Get portfolio statistics
export async function GET_STATS(request: NextRequest) {
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

// GET /api/search - Search projects
export async function GET_SEARCH(request: NextRequest) {
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
          { projectName: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { contains: q, mode: "insensitive" } },
          { keywords: { contains: q, mode: "insensitive" } },
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
