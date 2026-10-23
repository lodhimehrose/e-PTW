import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { SubmissionActions } from "@/components/admin/submission-actions";
import { EditSubmissionForm, IssueGatePassForm } from "@/components/admin/submission-tools";
import { getSignedUrl } from "@/lib/storage";
import { EhsqClassification } from "@/components/admin/ehsq-classification";
import { GatePassEditor } from "@/components/admin/gate-pass-editor";
import { OfficialFormView } from "@/components/admin/official-form-view";

function labelize(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (s) => s.toUpperCase());
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
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
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

  let signatureUrl: string | null = null;
  if (sub.signature_url) {
    try {
      signatureUrl = await getSignedUrl(sub.signature_url);
    } catch {
      signatureUrl = null;
    }
  }

  const { data: linkedGate } = sub.type === "gate_pass"
    ? { data: null }
    : await supabase
        .from("submissions")
        .select("*, workers(*), vehicles(*), tools(*), gate_logs(*)")
        .eq("linked_ref_no", sub.ref_no)
        .eq("type", "gate_pass")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

  const tab = searchParams.tab || "permit";
  const gate = linkedGate;
  const shown = tab === "gate" && gate ? gate : sub;
  const shownData = (shown.data ?? {}) as Record<string, unknown>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sma-gold">
            {sub.ref_no}
          </p>
          <h1 className="text-2xl font-bold text-foreground">{sub.ref_no}</h1>
          <p className="text-muted-foreground">{sub.company_name}</p>
          <div className="mt-2">
            <StatusBadge status={sub.status} urgent={sub.type === "ptw_emergency"} />
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`/api/pdf/${sub.ref_no}`} className="text-sm underline">Download PDF</a>
          <Link href="/admin/submissions" className="text-sm underline">Back to list</Link>
        </div>
      </div>
      <nav className="flex flex-wrap gap-2 text-sm">
        {[
          ["permit", "Permit"],
          ["gate", "Gate Pass"],
          ["documents", "Documents"],
          ["history", "History"],
        ].map(([key, label]) => (
          <Link key={key} href={`/admin/submissions/${sub.id}?tab=${key}`} className="rounded-full border border-border px-3 py-1">
            {label}
          </Link>
        ))}
      </nav>

      {tab === "permit" && (
      <OfficialFormView
        type={sub.type}
        refNo={sub.ref_no}
        status={sub.status}
        companyName={sub.company_name ?? ""}
        contactEmail={sub.contact_email ?? ""}
        building={sub.building ?? ""}
        startAt={sub.start_at}
        endAt={sub.end_at}
        data={data}
        workers={sub.workers ?? []}
        vehicles={sub.vehicles ?? []}
        tools={sub.tools ?? []}
        gateLogs={sub.gate_logs ?? []}
        signatureUrl={signatureUrl}
        documents={documents}
      />
      )}

      {tab === "gate" && gate && (
        <div className="space-y-4">
          <OfficialFormView
            type={gate.type}
            refNo={gate.ref_no}
            status={gate.status}
            companyName={gate.company_name ?? ""}
            contactEmail={gate.contact_email ?? ""}
            building={gate.building ?? ""}
            startAt={gate.start_at}
            endAt={gate.end_at}
            data={shownData}
            workers={gate.workers ?? []}
            vehicles={gate.vehicles ?? []}
            tools={gate.tools ?? []}
            gateLogs={gate.gate_logs ?? []}
            documents={documents}
          />
          {["draft", "pending"].includes(gate.status) && (
            <GatePassEditor
              id={gate.id}
              purpose={String(shownData.purpose || "")}
              building={gate.building ?? ""}
              maxWorkers={gate.max_workers ?? (gate.workers ?? []).length}
              workers={gate.workers ?? []}
            />
          )}
        </div>
      )}
      {tab === "gate" && !gate && <p className="text-sm text-muted-foreground">No gate pass has been created for this record yet.</p>}

      {tab === "documents" && (
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
      )}

      {sub.type !== "gate_pass" && (
        <EhsqClassification
          id={sub.id}
          workType={data.workType}
          lightWorks={data.lightWorks}
          criticalWorks={data.criticalWorks}
          safetyControls={data.safetyControls}
          showSafety={sub.type === "ptw_emergency"}
        />
      )}

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

      {tab === "history" && (
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
      )}
    </div>
  );
}
