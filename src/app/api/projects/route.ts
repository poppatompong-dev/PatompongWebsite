import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const MAX_LIMIT = 100;
const ALLOWED_STATUSES = ["completed", "in_progress", "planning"] as const;

async function isAuthenticated(): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) return false;
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

// GET /api/projects - Get all projects with filters (public, read-only)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");
    const categoryId = searchParams.get("categoryId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const rawPage = parseInt(searchParams.get("page") || "1");
    const rawLimit = parseInt(searchParams.get("limit") || "10");

    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, MAX_LIMIT);

    const where: Record<string, unknown> = {};
    if (clientId && /^[a-zA-Z0-9_-]+$/.test(clientId)) where.clientId = clientId;
    if (categoryId && /^[a-zA-Z0-9_-]+$/.test(categoryId)) where.categoryId = categoryId;
    if (type && type.length <= 100) where.type = type;
    if (status && (ALLOWED_STATUSES as readonly string[]).includes(status)) where.status = status;

    const skip = (page - 1) * limit;
    const total = await prisma.project.count({ where });
    const projects = await prisma.project.findMany({
      where,
      include: { client: true, category: true },
      skip,
      take: limit,
      orderBy: { projectNumber: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST /api/projects - Create new project (admin only)
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Required field validation
    if (!body.projectName || typeof body.projectName !== "string" || body.projectName.trim().length === 0) {
      return NextResponse.json({ success: false, error: "projectName is required" }, { status: 400 });
    }
    if (!body.slug || typeof body.slug !== "string" || !/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json({ success: false, error: "slug must be lowercase alphanumeric with hyphens" }, { status: 400 });
    }
    if (!body.clientId || !body.categoryId) {
      return NextResponse.json({ success: false, error: "clientId and categoryId are required" }, { status: 400 });
    }
    if (body.url && typeof body.url === "string") {
      try { new URL(body.url); } catch {
        return NextResponse.json({ success: false, error: "url must be a valid URL" }, { status: 400 });
      }
    }

    const project = await prisma.project.create({
      data: {
        projectId: String(body.projectId || "").slice(0, 50),
        projectNumber: Number(body.projectNumber) || 0,
        projectName: String(body.projectName).slice(0, 300),
        slug: String(body.slug).slice(0, 200),
        clientId: String(body.clientId),
        type: String(body.type || "").slice(0, 100),
        categoryId: String(body.categoryId),
        subcategory: body.subcategory ? String(body.subcategory).slice(0, 200) : null,
        url: body.url ? String(body.url).slice(0, 500) : null,
        description: body.description ? String(body.description).slice(0, 2000) : null,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        keywords: body.keywords ? JSON.stringify(body.keywords) : null,
        status: (ALLOWED_STATUSES as readonly string[]).includes(body.status) ? body.status : "completed",
        startDate: body.startDate ? new Date(body.startDate) : null,
        completedDate: body.completedDate ? new Date(body.completedDate) : null,
      },
      include: { client: true, category: true },
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return NextResponse.json({ success: false, error: "Failed to create project" }, { status: 500 });
  }
}
