"use server";

import { verifyCredentials, createSession, SESSION_COOKIE, SESSION_DURATION } from "@/lib/auth";
import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { error: "Username and password are required" };
    }

    const isValid = await verifyCredentials(username, password);

    if (!isValid) {
        return { error: "Invalid credentials" };
    }

    const sessionToken = await createSession(username);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_DURATION,
    });

    return { success: true };
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    return { success: true };
}
