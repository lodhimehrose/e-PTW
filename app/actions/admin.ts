"use server";

import { requireAdmin } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { renderSubmissionPdf } from "@/lib/pdf/render";
import { uploadBuffer } from "@/lib/storage";
import { formDisplayName, sendEmail } from "@/lib/email/send";
import QRCode from "qrcode";

export type Decision = "approved" | "approved_with_conditions" | "rejected";

export async function decideSubmission(
  id: string,
  decision: Decision,
  note: string,
) {
  const { user } = await requireAdmin();
  const supabase = createServiceClient();

  const { data: sub } = await supabase
    .from("submissions")
    .select("*, workers(*)")
    .eq("id", id)
    .single();

  if (!sub) return { ok: false as const, error: "Not found" };
  if (decision === "rejected" && !note.trim()) {
    return { ok: false as const, error: "Rejection reason required" };
  }

  const { data: settings } = await supabase.from("settings").select("*").limit(1).single();
  const adminName = settings?.admin_name || user.email || "EHS Officer";

  const status =
    decision === "rejected"
      ? "rejected"
      : decision === "approved_with_conditions"
        ? "approved_with_conditions"
        : "approved";

  const now = new Date().toISOString();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const verifyUrl = `${site}/verify/${sub.verify_token}`;

  let approvedPdfPath: string | null = null;

  if (decision !== "rejected") {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 160 });
    const pdfBuf = await renderSubmissionPdf({
      refNo: sub.ref_no,
      type: sub.type,
      formTitle: formDisplayName(sub.type),
      companyName: sub.company_name ?? "",
      status,
      data: (sub.data as Record<string, unknown>) ?? {},
      workers: sub.workers ?? [],
      approved: {
        adminName,
        signedAt: now,
        conditions: decision === "approved_with_conditions" ? note : undefined,
        qrDataUrl,
      },
    });
    approvedPdfPath = `${id}/approved.pdf`;
    await uploadBuffer(approvedPdfPath, pdfBuf, "application/pdf");

    const recipients: string[] = [sub.contact_email].filter(Boolean);
    const extra =
      sub.type === "gate_pass"
        ? settings?.gate_pass_recipients
        : sub.type === "ptw_emergency"
          ? settings?.ptw_emergency_recipients
          : settings?.ptw_standard_recipients;
    if (extra) {
      recipients.push(
        ...extra.split(",").map((e: string) => e.trim()).filter(Boolean),
      );
    }

    await sendEmail({
      to: recipients,
      subject: `Approved – ${formDisplayName(sub.type)} ${sub.ref_no}`,
      html: `<p>Your permit <strong>${sub.ref_no}</strong> has been approved.</p>
        ${note ? `<p>Conditions: ${note}</p>` : ""}
        <p><a href="${verifyUrl}">Verify permit</a></p>`,
      attachments: [{ filename: `${sub.ref_no}-approved.pdf`, content: pdfBuf }],
    });
  } else {
    await sendEmail({
      to: sub.contact_email,
      subject: `Not approved – ${sub.ref_no}`,
      html: `<p>Your submission was not approved.</p><p><strong>Reason:</strong> ${note}</p>
        <p><a href="${site}">Submit again</a></p>`,
    });
  }

  await supabase
    .from("submissions")
    .update({
      status,
      decision_note: note || null,
      approved_at: decision === "rejected" ? null : now,
      approved_pdf_url: approvedPdfPath,
    })
    .eq("id", id);

  await supabase.from("audit_log").insert({
    submission_id: id,
    action: status,
    note,
    actor: user.email,
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/submissions/${id}`);
  return { ok: true as const };
}

export async function updateSubmissionStatus(
  id: string,
  status: string,
  note?: string,
) {
  const { user } = await requireAdmin();
  const supabase = createServiceClient();
  await supabase
    .from("submissions")
    .update({
      status,
      closed_at: ["closed", "cancelled"].includes(status)
        ? new Date().toISOString()
        : null,
    })
    .eq("id", id);
  await supabase.from("audit_log").insert({
    submission_id: id,
    action: status,
    note,
    actor: user.email,
  });
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function addRevalidation(
  submissionId: string,
  date: string,
  workersOnSite: number,
  remarks: string,
) {
  const { user } = await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("revalidations").insert({
    submission_id: submissionId,
    date,
    workers_on_site: workersOnSite,
    remarks,
    signed_at: new Date().toISOString(),
  });
  await supabase.from("audit_log").insert({
    submission_id: submissionId,
    action: "revalidated",
    note: `${workersOnSite} workers — ${remarks}`,
    actor: user.email,
  });
  revalidatePath(`/admin/submissions/${submissionId}`);
  return { ok: true as const };
}

export async function addGateLog(
  submissionId: string,
  entry: {
    date: string;
    timeIn: string;
    workersIn: number;
    timeOut?: string;
    workersOut?: number;
    guardName: string;
  },
) {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("gate_logs").insert({
    submission_id: submissionId,
    date: entry.date,
    time_in: entry.timeIn,
    workers_in: entry.workersIn,
    time_out: entry.timeOut || null,
    workers_out: entry.workersOut ?? null,
    guard_name: entry.guardName,
  });
  revalidatePath(`/admin/submissions/${submissionId}`);
  return { ok: true as const };
}

export async function saveSettings(form: {
  gatePassRecipients: string;
  ptwStandardRecipients: string;
  ptwEmergencyRecipients: string;
  adminName: string;
  maxPermitDays: number;
  emergencyMaxHours: number;
  buildings: string;
}) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: row } = await supabase.from("settings").select("id").limit(1).single();
  const buildings = form.buildings
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean);
  await supabase
    .from("settings")
    .update({
      gate_pass_recipients: form.gatePassRecipients,
      ptw_standard_recipients: form.ptwStandardRecipients,
      ptw_emergency_recipients: form.ptwEmergencyRecipients,
      admin_name: form.adminName,
      max_permit_days: form.maxPermitDays,
      emergency_max_hours: form.emergencyMaxHours,
      buildings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row?.id);
  revalidatePath("/admin/settings");
  return { ok: true as const };
}
