import Link from "next/link";
import { format } from "date-fns";
import { createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { createdAtBounds } from "@/lib/date-range";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const supabase = createServiceClient();
  const { start, end } = createdAtBounds(searchParams.from, searchParams.to);
  const today = format(new Date(), "yyyy-MM-dd");

  let pendingQuery = supabase
    .from("submissions")
    .select("id, ref_no, type, company_name, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);
  let pendingCountQuery = supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  let activeCountQuery = supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .in("status", ["approved", "approved_with_conditions", "active"]);

  if (start) {
    pendingQuery = pendingQuery.gte("created_at", start);
    pendingCountQuery = pendingCountQuery.gte("created_at", start);
    activeCountQuery = activeCountQuery.gte("created_at", start);
  }
  if (end) {
    pendingQuery = pendingQuery.lte("created_at", end);
    pendingCountQuery = pendingCountQuery.lte("created_at", end);
    activeCountQuery = activeCountQuery.lte("created_at", end);
  }

  const [{ data: pending }, { count: pendingCount }, { count: activeCount }] = await Promise.all([
    pendingQuery,
    pendingCountQuery,
    activeCountQuery,
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <DateRangeFilter from={searchParams.from} to={searchParams.to} clearHref="/admin" />
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
              className="flex items-center justify-between rounded border p-3 hover:bg-muted"
            >
              <div>
                <p className="font-medium">{s.ref_no}</p>
                <p className="text-sm text-muted-foreground">
                  {s.company_name} · {format(new Date(s.created_at), "dd MMM yyyy")}
                </p>
              </div>
              <StatusBadge status={s.status} urgent={s.type === "ptw_emergency"} />
            </Link>
          ))}
          {!pending?.length && (
            <p className="text-sm text-muted-foreground">No pending items in this date range.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
