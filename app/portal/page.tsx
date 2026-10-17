import Link from "next/link";
import { format } from "date-fns";
import { ClipboardList, HardHat, Siren } from "lucide-react";
import { PortalFrame } from "@/components/portal-frame";
import { StatusBadge } from "@/components/status-badge";
import { requirePortalUser, submissionTypeLabel } from "@/lib/portal";
import { createServiceClient } from "@/lib/supabase/server";
import { createdAtBounds } from "@/lib/date-range";
import { DateRangeFilter } from "@/components/admin/date-range-filter";

const forms = [
  { href: "/gate-pass", title: "Gate Pass", ref: "Form-08", icon: ClipboardList },
  { href: "/ptw/standard", title: "Standard PTW", ref: "Form-07", icon: HardHat },
  { href: "/ptw/emergency", title: "Emergency PTW", ref: "Form-07A", icon: Siren },
];

export default async function PortalPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const user = await requirePortalUser();
  const supabase = createServiceClient();
  const { start, end } = createdAtBounds(searchParams.from, searchParams.to);
  let query = supabase
    .from("submissions")
    .select("id, ref_no, type, company_name, status, created_at")
    .or(`owner_id.eq.${user.id},contact_email.ilike.${user.email}`)
    .order("created_at", { ascending: false });
  if (start) query = query.gte("created_at", start);
  if (end) query = query.lte("created_at", end);
  const { data: rows, error } = await query;

  const list = rows ?? [];
  const pending = list.filter((row) => row.status === "pending").length;
  const approved = list.filter((row) =>
    ["approved", "approved_with_conditions", "active"].includes(row.status),
  ).length;

  return (
    <PortalFrame user={user} title="Your submissions">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">All</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{list.length}</p>
        </div>
        <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Waiting</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{pending}</p>
        </div>
        <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Approved / active</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{approved}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {forms.map((form) => (
          <Link
            key={form.href}
            href={form.href}
            className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border hover:ring-sma-gold/60"
          >
            <form.icon className="h-5 w-5 text-sma-gold" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-sma-gold">{form.ref}</p>
            <p className="mt-1 font-semibold text-foreground">{form.title}</p>
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h2 className="text-lg font-semibold text-foreground">Track a request</h2>
        <div className="mt-4">
          <DateRangeFilter from={searchParams.from} to={searchParams.to} clearHref="/portal" />
        </div>
        {error && (
          <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
            The portal needs one database update. In Supabase, open SQL Editor and run
            supabase/migrations/003_submitter_portal.sql, then refresh this page.
          </p>
        )}
        {!error && !list.length && (
          <p className="mt-4 text-sm text-muted-foreground">
            No submissions yet. Open a form above while you are signed in, and it will appear here.
          </p>
        )}
        <div className="mt-4 space-y-2">
          {list.map((row) => (
            <Link
              key={row.id}
              href={`/portal/track/${encodeURIComponent(row.ref_no)}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 hover:bg-muted"
            >
              <div>
                <p className="font-medium text-foreground">{row.ref_no}</p>
                <p className="text-xs text-muted-foreground">
                  {submissionTypeLabel(row.type)}
                  {row.company_name ? ` · ${row.company_name}` : ""} ·{" "}
                  {format(new Date(row.created_at), "d MMM yyyy")}
                </p>
              </div>
              <StatusBadge status={row.status} urgent={row.type === "ptw_emergency"} />
            </Link>
          ))}
        </div>
      </section>
    </PortalFrame>
  );
}
