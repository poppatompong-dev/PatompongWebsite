"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
