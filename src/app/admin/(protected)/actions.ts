"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Portfolio Actions
export async function getPortfolioProjects() {
    return await prisma.portfolioProject.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function createPortfolioProject(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const url = formData.get("url") as string | null;
    const imageUrl = formData.get("imageUrl") as string | null;
    const tags = formData.get("tags") as string | null;

    await prisma.portfolioProject.create({
        data: {
            title,
            description,
            url,
            imageUrl,
            tags,
        },
    });

    revalidatePath("/admin");
    return { success: true };
}

export async function deletePortfolioProject(id: string) {
    await prisma.portfolioProject.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
}

// Timeline Actions
export async function getTimelineEvents() {
    return await prisma.timelineEvent.findMany({
        orderBy: { date: "desc" },
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
    return { success: true };
}

export async function deleteTimelineEvent(id: string) {
    await prisma.timelineEvent.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
}
