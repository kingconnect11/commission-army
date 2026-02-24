import { redirect } from "next/navigation";
import { getProfile } from "@/lib/actions/auth";
import { DashboardShell } from "@/components/DashboardShell";

// Admin access list — keep in sync with src/lib/actions/admin.ts
const ADMIN_EMAILS = ["kingconnection@icloud.com"];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.onboarding_complete) {
    redirect("/onboarding");
  }

  const isAdmin = ADMIN_EMAILS.includes(profile.email);

  return (
    <DashboardShell
      role={profile.role}
      userName={profile.full_name || "User"}
      avatarUrl={profile.avatar_url}
      isAdmin={isAdmin}
    >
      {children}
    </DashboardShell>
  );
}
