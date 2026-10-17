import Link from "next/link";
import { format } from "date-fns";
import { createServiceClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { createdAtBounds } from "@/lib/date-range";

function listHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `/admin/submissions?${query}` : "/admin/submissions";
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: { type?: string; status?: string; q?: string; from?: string; to?: string };
}) {
  const supabase = createServiceClient();
  const { start, end } = createdAtBounds(searchParams.from, searchParams.to);
  let q = supabase
    .from("submissions")
    .select("id, ref_no, type, company_name, status, building, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (searchParams.type) q = q.eq("type", searchParams.type);
  if (searchParams.status) q = q.eq("status", searchParams.status);
  if (searchParams.q) {
    q = q.or(
      `ref_no.ilike.%${searchParams.q}%,company_name.ilike.%${searchParams.q}%`,
    );
  }
  if (start) q = q.gte("created_at", start);
  if (end) q = q.lte("created_at", end);

  const { data: rows } = await q;
  const exportHref = listHref({
    type: searchParams.type,
    status: searchParams.status,
    q: searchParams.q,
    from: searchParams.from,
    to: searchParams.to,
  }).replace("/admin/submissions", "/api/admin/export");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-foreground">Submissions</h1>
        <Button asChild variant="outline" size="sm">
          <a href={exportHref}>Export Excel</a>
        </Button>
      </div>
      <DateRangeFilter
        from={searchParams.from}
        to={searchParams.to}
        clearHref={listHref({ type: searchParams.type, status: searchParams.status, q: searchParams.q })}
        hidden={[
          { name: "type", value: searchParams.type ?? "" },
          { name: "status", value: searchParams.status ?? "" },
          { name: "q", value: searchParams.q ?? "" },
        ]}
      />
      <div className="flex flex-wrap gap-2 text-sm">
        {[
          ["", "All"],
          ["gate_pass", "Gate Pass"],
          ["ptw_standard", "Standard PTW"],
          ["ptw_emergency", "Emergency"],
        ].map(([t, label]) => (
          <Link
            key={t || "all"}
            href={listHref({
              type: t,
              status: searchParams.status,
              q: searchParams.q,
              from: searchParams.from,
              to: searchParams.to,
            })}
            className="rounded border px-3 py-1 hover:bg-muted"
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3">Ref</th>
              <th className="p-3">Company</th>
              <th className="p-3">Building</th>
              <th className="p-3">Submitted</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3 font-medium">{s.ref_no}</td>
                <td className="p-3">{s.company_name}</td>
                <td className="p-3">{s.building}</td>
                <td className="p-3">{format(new Date(s.created_at), "dd MMM yyyy")}</td>
                <td className="p-3">
                  <StatusBadge status={s.status} urgent={s.type === "ptw_emergency"} />
                </td>
                <td className="p-3">
                  <Link href={`/admin/submissions/${s.id}`} className="underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows?.length && <p className="p-4 text-sm text-muted-foreground">No submissions in this date range.</p>}
      </div>
    </div>
  );
}
