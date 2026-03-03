import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isValidSession = await getSession();

    if (!isValidSession) {
        redirect("/admin/login");
    }

    return <>{children}</>;
}
