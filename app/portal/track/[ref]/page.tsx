import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { PortalFrame } from "@/components/portal-frame";
import { StatusBadge } from "@/components/status-badge";
import { requirePortalUser, statusNote, submissionTypeLabel } from "@/lib/portal";
import { createServiceClient } from "@/lib/supabase/server";

export default async function TrackPage({ params }: { params: { ref: string } }) {
  const user = await requirePortalUser();
  const ref = decodeURIComponent(params.ref);
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("submissions")
    .select(
      "ref_no, type, status, company_name, contact_email, building, start_at, end_at, decision_note, created_at, approved_at, closed_at, owner_id, linked_ref_no",
    )
    .eq("ref_no", ref)
    .maybeSingle();

  const owns =
    data &&
    (data.owner_id === user.id ||
      data.contact_email?.toLowerCase() === user.email.toLowerCase());
  if (!data || !owns) notFound();

  const moments = [
    { label: "Submitted", at: data.created_at },
    { label: "Decision", at: data.approved_at },
    { label: "Closed", at: data.closed_at },
  ].filter((item) => item.at);

  return (
    <PortalFrame user={user} title={data.ref_no}>
      <div className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sma-gold">
              {submissionTypeLabel(data.type)}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">{data.ref_no}</h2>
          </div>
          <StatusBadge status={data.status} urgent={data.type === "ptw_emergency"} />
          <a href={`/api/pdf/${data.ref_no}`} className="text-sm underline">Download PDF</a>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{statusNote(data.status)}</p>
        {data.decision_note && (
          <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
            EHS note: {data.decision_note}
          </p>
        )}
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Company</dt>
            <dd className="mt-1 text-foreground">{data.company_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Location</dt>
            <dd className="mt-1 text-foreground">{data.building || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Starts</dt>
            <dd className="mt-1 text-foreground">
              {data.start_at ? format(new Date(data.start_at), "d MMM yyyy, HH:mm") : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Ends</dt>
            <dd className="mt-1 text-foreground">
              {data.end_at ? format(new Date(data.end_at), "d MMM yyyy, HH:mm") : "—"}
            </dd>
          </div>
          {data.linked_ref_no && (
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Linked permit</dt>
              <dd className="mt-1 text-foreground">{data.linked_ref_no}</dd>
            </div>
          )}
        </dl>
        <ol className="mt-6 space-y-2 border-t border-border pt-4">
          {moments.map((item) => (
            <li key={item.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="text-foreground">{format(new Date(item.at), "d MMM yyyy, HH:mm")}</span>
            </li>
          ))}
        </ol>
        <Link href="/portal" className="mt-6 inline-block text-sm font-medium text-foreground underline-offset-4 hover:underline">
          Back to submissions
        </Link>
      </div>
    </PortalFrame>
  );
}
