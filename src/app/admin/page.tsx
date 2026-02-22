import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const isAuthenticated = await getSession();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
