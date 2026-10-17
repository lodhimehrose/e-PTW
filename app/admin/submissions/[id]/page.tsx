import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { SubmissionActions } from "@/components/admin/submission-actions";
import { EditSubmissionForm, IssueGatePassForm } from "@/components/admin/submission-tools";
import { getSignedUrl } from "@/lib/storage";
import { submissionTypeLabel } from "@/lib/portal";

function labelize(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (s) => s.toUpperCase());
}

function showValue(value: unknown) {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const hiddenKeys = new Set([
  "honeypot",
  "signatureDataUrl",
  "uploads",
  "workers",
  "vehicles",
  "tools",
]);

export default async function SubmissionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServiceClient();
  const { data: sub } = await supabase
    .from("submissions")
    .select("*, workers(*), documents(*), vehicles(*), tools(*), revalidations(*), gate_logs(*)")
    .eq("id", params.id)
    .single();

  const { data: audit } = await supabase
    .from("audit_log")
    .select("*")
    .eq("submission_id", params.id)
    .order("created_at", { ascending: false });

  if (!sub) return <p>Not found</p>;

  const data = (sub.data ?? {}) as Record<string, unknown>;
  const entries = Object.entries(data).filter(([key]) => !hiddenKeys.has(key));
  const editable = entries
    .filter(([, value]) => typeof value === "string" || typeof value === "number")
    .map(([key, value]) => ({ key, label: labelize(key), value: String(value ?? "") }));

  let pdfLink: string | null = null;
  if (sub.pdf_url) {
    try {
      pdfLink = await getSignedUrl(sub.pdf_url);
    } catch {
      pdfLink = null;
    }
  }

  const documents = await Promise.all(
    (sub.documents ?? []).map(async (doc: { id: string; file_url: string; file_name: string | null; doc_type: string }) => {
      let href: string | null = null;
      try {
        href = await getSignedUrl(doc.file_url);
      } catch {
        href = null;
      }
      return { ...doc, href };
    }),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sma-gold">
            {submissionTypeLabel(sub.type)}
          </p>
          <h1 className="text-2xl font-bold text-foreground">{sub.ref_no}</h1>
          <p className="text-muted-foreground">{sub.company_name}</p>
          <div className="mt-2">
            <StatusBadge status={sub.status} urgent={sub.type === "ptw_emergency"} />
          </div>
        </div>
        <Link href="/admin/submissions" className="text-sm underline">
          Back to list
        </Link>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold text-foreground">Form details</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Contact email</dt>
            <dd>{sub.contact_email || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Location</dt>
            <dd>{sub.building || "—"}</dd>
          </div>
          {entries.map(([key, value]) => (
            <div key={key}>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">{labelize(key)}</dt>
              <dd className="break-words">{showValue(value)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {(sub.workers ?? []).length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Workers</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {sub.workers.map((worker: { id: string; full_name: string; trade: string; emirates_id: string; eid_expiry: string; mobile: string }) => (
              <li key={worker.id} className="rounded-lg border border-border px-3 py-2">
                {worker.full_name} · {worker.trade} · {worker.emirates_id} · expires {worker.eid_expiry} · {worker.mobile}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(sub.vehicles ?? []).length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Vehicles</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {sub.vehicles.map((vehicle: { id: string; vehicle_type: string; plate_no: string; driver_name: string }) => (
              <li key={vehicle.id}>
                {vehicle.vehicle_type || "Vehicle"} · {vehicle.plate_no || "no plate"} · {vehicle.driver_name || "no driver"}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(sub.tools ?? []).length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Tools</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {sub.tools.map((tool: { id: string; description: string; quantity: string; serial_id: string }) => (
              <li key={tool.id}>
                {tool.description} · qty {tool.quantity || "—"} · {tool.serial_id || "no serial"}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold text-foreground">Documents</h2>
        {pdfLink && (
          <a href={pdfLink} target="_blank" rel="noreferrer" className="mt-3 block text-sm font-medium underline">
            View submitted PDF
          </a>
        )}
        {documents.length === 0 && !pdfLink && (
          <p className="mt-3 text-sm text-muted-foreground">No files were attached.</p>
        )}
        <ul className="mt-3 space-y-4 text-sm">
          {documents.map((doc) => (
            <li key={doc.id}>
              {doc.href ? (
                <a href={doc.href} target="_blank" rel="noreferrer" className="font-medium underline">
                  {doc.file_name || doc.doc_type}
                </a>
              ) : (
                <span>{doc.file_name || doc.doc_type} (file unavailable)</span>
              )}
              {doc.href && /\.(png|jpe?g|gif|webp|bmp)$/i.test(doc.file_name || "") && (
                // Signed storage URLs are temporary, so a plain image is used.
                <img src={doc.href} alt={doc.file_name || "Attachment"} className="mt-2 max-h-64 rounded-lg border border-border" />
              )}
            </li>
          ))}
        </ul>
      </section>

      <SubmissionActions id={sub.id} type={sub.type} />

      <EditSubmissionForm
        id={sub.id}
        companyName={sub.company_name ?? ""}
        contactEmail={sub.contact_email ?? ""}
        building={sub.building ?? ""}
        fields={editable}
      />

      {sub.type !== "gate_pass" && (
        <IssueGatePassForm
          permitId={sub.id}
          companyName={sub.company_name ?? ""}
          contactEmail={sub.contact_email ?? ""}
          building={sub.building ?? ""}
        />
      )}

      <div>
        <h3 className="font-medium">Audit log</h3>
        <ul className="text-xs text-muted-foreground">
          {(audit ?? []).map((entry: { id: string; action: string; note: string; created_at: string }) => (
            <li key={entry.id}>
              {entry.created_at} — {entry.action}: {entry.note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
