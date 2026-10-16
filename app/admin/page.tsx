import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";

export default async function AdminDashboard() {
  const supabase = createServiceClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: pending } = await supabase
    .from("submissions")
    .select("id, ref_no, type, company_name, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(20);

  const { count: pendingCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: activeCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .in("status", ["approved", "approved_with_conditions", "active"]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sma-navy">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending review</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{pendingCount ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active / approved</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{activeCount ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Today</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{today}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending submissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(pending ?? []).map((s) => (
            <Link
              key={s.id}
              href={`/admin/submissions/${s.id}`}
              className="flex items-center justify-between rounded border p-3 hover:bg-white"
            >
              <div>
                <p className="font-medium">{s.ref_no}</p>
                <p className="text-sm text-muted-foreground">{s.company_name}</p>
              </div>
              <StatusBadge
                status={s.status}
                urgent={s.type === "ptw_emergency"}
              />
            </Link>
          ))}
          {!pending?.length && (
            <p className="text-sm text-muted-foreground">No pending items.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
