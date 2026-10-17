import { AdminShell } from "@/components/admin/admin-shell";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let accounts: { id: string; email: string; name: string }[] = [];
  try {
    const supabase = createServiceClient();
    const { data } = await supabase.auth.admin.listUsers({ perPage: 200 });
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    accounts = (data.users ?? [])
      .filter((user) => user.email && user.email.toLowerCase() !== adminEmail)
      .map((user) => ({
        id: user.id,
        email: user.email as string,
        name: (user.user_metadata?.full_name as string | undefined) || (user.email as string),
      }))
      .sort((a, b) => a.email.localeCompare(b.email));
  } catch {
    accounts = [];
  }

  return <AdminShell accounts={accounts}>{children}</AdminShell>;
}
