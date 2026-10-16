import { createServiceClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { SubmissionActions } from "@/components/admin/submission-actions";
import { getSignedUrl } from "@/lib/storage";
import Link from "next/link";

export default async function SubmissionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServiceClient();
  const { data: sub } = await supabase
    .from("submissions")
    .select("*, workers(*), documents(*), revalidations(*), gate_logs(*)")
    .eq("id", params.id)
    .single();

  const { data: audit } = await supabase
    .from("audit_log")
    .select("*")
    .eq("submission_id", params.id)
    .order("created_at", { ascending: false });

  if (!sub) {
    return <p>Not found</p>;
  }

  let pdfLink: string | null = null;
  if (sub.pdf_url) {
    try {
      pdfLink = await getSignedUrl(sub.pdf_url);
    } catch {
      pdfLink = null;
    }
  }

  const verifyUrl = sub.verify_token
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/verify/${sub.verify_token}`
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sma-navy">{sub.ref_no}</h1>
          <p className="text-muted-foreground">{sub.company_name}</p>
          <StatusBadge
            status={sub.status}
            urgent={sub.type === "ptw_emergency"}
          />
        </div>
        <Link href="/admin/submissions" className="text-sm underline">
          Back to list
        </Link>
      </div>

      {pdfLink && (
        <a
          href={pdfLink}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-sma-navy underline"
        >
          View submitted PDF
        </a>
      )}

      {verifyUrl && (
        <p className="text-sm">
          Verification:{" "}
          <a href={verifyUrl} className="underline">{verifyUrl}</a>
        </p>
      )}

      <pre className="max-h-64 overflow-auto rounded bg-slate-100 p-3 text-xs">
        {JSON.stringify(sub.data, null, 2)}
      </pre>

      <div>
        <h3 className="font-medium">Workers</h3>
        <ul className="text-sm">
          {(sub.workers ?? []).map((w: { full_name: string; emirates_id: string }) => (
            <li key={w.emirates_id}>{w.full_name} — {w.emirates_id}</li>
          ))}
        </ul>
      </div>

      <SubmissionActions id={sub.id} type={sub.type} />

      <div>
        <h3 className="font-medium">Audit log</h3>
        <ul className="text-xs text-muted-foreground">
          {(audit ?? []).map((a: { id: string; action: string; note: string; created_at: string }) => (
            <li key={a.id}>
              {a.created_at} — {a.action}: {a.note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
