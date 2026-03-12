"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import os from "os";
import fs from "fs/promises";
import path from "path";

// ==================== System Actions ====================

async function getDirectorySize(dirPath: string): Promise<number> {
    try {
        const stats = await fs.stat(dirPath);
        if (stats.isFile()) return stats.size;
        if (stats.isDirectory()) {
            const files = await fs.readdir(dirPath);
            const sizes = await Promise.all(
                files.map((file) => getDirectorySize(path.join(dirPath, file)))
            );
            return sizes.reduce((acc, curr) => acc + curr, 0);
        }
        return 0;
    } catch (e) {
        return 0;
    }
}

export async function getSystemStats() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const uptime = os.uptime();

    // Calculate storage usage specifically for photos
    const projectRoot = process.cwd();
    const tempPhotosSize = await getDirectorySize(path.join(projectRoot, "temp_photos"));
    const publicSize = await getDirectorySize(path.join(projectRoot, "public"));
    const totalStorageUsed = tempPhotosSize + publicSize;

    // GitHub recommended soft limit is 1GB (1024 * 1024 * 1024 bytes)
    const MAX_STORAGE = 1073741824;

    return {
        memory: {
            used: usedMem,
            total: totalMem,
            percentage: Math.round((usedMem / totalMem) * 100)
        },
        storage: {
            used: totalStorageUsed,
            total: MAX_STORAGE,
            percentage: Math.min(100, Math.round((totalStorageUsed / MAX_STORAGE) * 100)),
            tempPhotosSize
        },
        os: `${os.type()} ${os.release()} (${os.arch()})`,
        node: process.version,
        uptime,
    };
}

// ==================== Portfolio Actions ====================

export async function getPortfolioProjects() {
    return await prisma.portfolioProject.findMany({
        orderBy: { createdAt: "desc" },
        include: { attachments: true },
    });
}

export async function createPortfolioProject(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const url = formData.get("url") as string | null;
    const imageUrl = formData.get("imageUrl") as string | null;
    const tags = formData.get("tags") as string | null;

    await prisma.portfolioProject.create({
        data: { title, description, url, imageUrl, tags },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
}

export async function deletePortfolioProject(id: string) {
    await prisma.portfolioProject.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
}

export async function togglePortfolioFeatured(id: string) {
    const project = await prisma.portfolioProject.findUnique({ where: { id } });
    if (!project) return { success: false };
    await prisma.portfolioProject.update({
        where: { id },
        data: { isFeatured: !project.isFeatured },
    });
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, isFeatured: !project.isFeatured };
}

export async function generatePortfolioShareLink(id: string) {
    const slug = `portfolio-${id.slice(0, 8)}-${Date.now().toString(36)}`;
    await prisma.portfolioProject.update({
        where: { id },
        data: { shareSlug: slug },
    });
    revalidatePath("/admin");
    return { success: true, slug };
}

// ==================== Timeline Actions ====================

export async function getTimelineEvents() {
    return await prisma.timelineEvent.findMany({
        orderBy: { date: "desc" },
        include: { attachments: true },
    });
}

export async function createTimelineEvent(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const dateStr = formData.get("date") as string;
    const category = formData.get("category") as string;
    const location = formData.get("location") as string | null;
    const imageUrl = formData.get("imageUrl") as string | null;

    await prisma.timelineEvent.create({
        data: {
            title,
            description,
            date: new Date(dateStr),
            category,
            location,
            imageUrl,
        },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
}

export async function deleteTimelineEvent(id: string) {
    await prisma.timelineEvent.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
}

export async function toggleTimelinePublic(id: string) {
    const event = await prisma.timelineEvent.findUnique({ where: { id } });
    if (!event) return { success: false };
    await prisma.timelineEvent.update({
        where: { id },
        data: { isPublic: !event.isPublic },
    });
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, isPublic: !event.isPublic };
}

export async function generateTimelineShareLink(id: string) {
    const slug = `timeline-${id.slice(0, 8)}-${Date.now().toString(36)}`;
    await prisma.timelineEvent.update({
        where: { id },
        data: { shareSlug: slug },
    });
    revalidatePath("/admin");
    return { success: true, slug };
}

// ==================== Attachment Actions ====================

export async function addAttachment(data: {
    parentType: "portfolio" | "timeline";
    parentId: string;
    filename: string;
    url: string;
    fileType: string;
    fileSize?: number;
}) {
    await prisma.attachment.create({
        data: {
            filename: data.filename,
            url: data.url,
            fileType: data.fileType,
            fileSize: data.fileSize ?? null,
            portfolioId: data.parentType === "portfolio" ? data.parentId : null,
            timelineId: data.parentType === "timeline" ? data.parentId : null,
        },
    });

    revalidatePath("/admin");
    return { success: true };
}

export async function deleteAttachment(id: string) {
    await prisma.attachment.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
}

// ==================== Project (Showcase) Actions ====================

export async function getProjects() {
    return await prisma.project.findMany({
        orderBy: { projectNumber: "asc" },
        include: { client: true, category: true },
    });
}

export async function getProjectClients() {
    return await prisma.client.findMany({ orderBy: { clientName: "asc" } });
}

export async function getProjectCategories() {
    return await prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createProject(formData: FormData) {
    const projectName = formData.get("projectName") as string;
    const slug = formData.get("slug") as string;
    const clientId = formData.get("clientId") as string;
    const categoryId = formData.get("categoryId") as string;
    const type = formData.get("type") as string;
    const subcategory = formData.get("subcategory") as string;
    const description = formData.get("description") as string | null;
    const url = formData.get("url") as string | null;
    const tags = formData.get("tags") as string | null;
    const keywords = formData.get("keywords") as string | null;
    const status = (formData.get("status") as string) || "completed";
    const startDate = formData.get("startDate") as string | null;
    const completedDate = formData.get("completedDate") as string | null;

    const maxNum = await prisma.project.aggregate({ _max: { projectNumber: true } });
    const nextNum = (maxNum._max.projectNumber || 0) + 1;
    const projectId = `proj_${String(nextNum).padStart(3, "0")}`;

    await prisma.project.create({
        data: {
            projectId,
            projectNumber: nextNum,
            projectName,
            slug,
            clientId,
            categoryId,
            type,
            subcategory,
            description: description || null,
            url: url || null,
            tags: tags || null,
            keywords: keywords || null,
            status,
            startDate: startDate ? new Date(startDate) : null,
            completedDate: completedDate ? new Date(completedDate) : null,
        },
    });

    revalidatePath("/admin");
    revalidatePath("/projects");
    return { success: true };
}

export async function updateProject(id: string, formData: FormData) {
    const projectName = formData.get("projectName") as string;
    const slug = formData.get("slug") as string;
    const clientId = formData.get("clientId") as string;
    const categoryId = formData.get("categoryId") as string;
    const type = formData.get("type") as string;
    const subcategory = formData.get("subcategory") as string;
    const description = formData.get("description") as string | null;
    const url = formData.get("url") as string | null;
    const tags = formData.get("tags") as string | null;
    const keywords = formData.get("keywords") as string | null;
    const status = (formData.get("status") as string) || "completed";
    const startDate = formData.get("startDate") as string | null;
    const completedDate = formData.get("completedDate") as string | null;

    await prisma.project.update({
        where: { id },
        data: {
            projectName,
            slug,
            clientId,
            categoryId,
            type,
            subcategory,
            description: description || null,
            url: url || null,
            tags: tags || null,
            keywords: keywords || null,
            status,
            startDate: startDate ? new Date(startDate) : null,
            completedDate: completedDate ? new Date(completedDate) : null,
        },
    });

    revalidatePath("/admin");
    revalidatePath("/projects");
    return { success: true };
}

export async function deleteProject(id: string) {
    await prisma.project.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/projects");
    return { success: true };
}

// ==================== Share Page Fetch ====================

export async function getSharedItem(slug: string) {
    // Try portfolio first
    const portfolio = await prisma.portfolioProject.findUnique({
        where: { shareSlug: slug },
        include: { attachments: true },
    });
    if (portfolio) return { type: "portfolio" as const, data: portfolio };

    // Then try timeline
    const timeline = await prisma.timelineEvent.findUnique({
        where: { shareSlug: slug },
        include: { attachments: true },
    });
    if (timeline) return { type: "timeline" as const, data: timeline };

    return null;
}
