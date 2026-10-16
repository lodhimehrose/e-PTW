import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: { type?: string; status?: string; q?: string };
}) {
  const supabase = createServiceClient();
  let q = supabase
    .from("submissions")
    .select("id, ref_no, type, company_name, status, building, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchParams.type) q = q.eq("type", searchParams.type);
  if (searchParams.status) q = q.eq("status", searchParams.status);
  if (searchParams.q) {
    q = q.or(
      `ref_no.ilike.%${searchParams.q}%,company_name.ilike.%${searchParams.q}%`,
    );
  }

  const { data: rows } = await q;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-sma-navy">Submissions</h1>
        <Button asChild variant="outline" size="sm">
          <a href="/api/admin/export">Export Excel</a>
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        {[
          ["", "All"],
          ["gate_pass", "Gate Pass"],
          ["ptw_standard", "Standard PTW"],
          ["ptw_emergency", "Emergency"],
        ].map(([t, label]) => (
          <Link
            key={t || "all"}
            href={t ? `/admin/submissions?type=${t}` : "/admin/submissions"}
            className="rounded border px-3 py-1 hover:bg-white"
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-sma-section text-left">
            <tr>
              <th className="p-3">Ref</th>
              <th className="p-3">Company</th>
              <th className="p-3">Building</th>
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
                <td className="p-3">
                  <StatusBadge
                    status={s.status}
                    urgent={s.type === "ptw_emergency"}
                  />
                </td>
                <td className="p-3">
                  <Link
                    href={`/admin/submissions/${s.id}`}
                    className="text-sma-navy underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
