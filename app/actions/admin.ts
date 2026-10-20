"use server";

import { requireAdmin } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { renderSubmissionPdf } from "@/lib/pdf/render";
import { uploadBuffer } from "@/lib/storage";
import { formDisplayName, sendEmail } from "@/lib/email/send";
import { APPROVAL_CONTACTS } from "@/lib/constants";
import QRCode from "qrcode";

function uniqueAddresses(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const value of values) {
    const email = value?.trim();
    if (!email || !email.includes("@")) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    emails.push(email);
  }
  return emails;
}

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

  const saved = await supabase
    .from("submissions")
    .update({
      status,
      decision_note: note || null,
      approved_at: decision === "rejected" ? null : now,
    })
    .eq("id", id);
  if (saved.error) return { ok: false as const, error: "Could not save the decision." };

  await supabase.from("audit_log").insert({
    submission_id: id,
    action: status,
    note,
    actor: user.email,
  });

  if (sub.type !== "gate_pass") {
    await supabase
      .from("submissions")
      .update({
        status,
        decision_note: note || (decision === "rejected" ? null : "Issued with the approved permit"),
        approved_at: decision === "rejected" ? null : now,
      })
      .eq("linked_ref_no", sub.ref_no)
      .eq("type", "gate_pass");
  }

  let approvedPdfPath: string | null = null;

  try {
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

    const configured =
      sub.type === "gate_pass"
        ? settings?.gate_pass_recipients
        : sub.type === "ptw_emergency"
          ? settings?.ptw_emergency_recipients
          : settings?.ptw_standard_recipients;
    const recipients = uniqueAddresses([
      sub.contact_email,
      ...APPROVAL_CONTACTS,
      ...(configured ? String(configured).split(",") : []),
    ]);

    await sendEmail({
      to: recipients,
      subject: `Approved – ${formDisplayName(sub.type)} ${sub.ref_no}`,
      html: `<p><strong>${sub.company_name}</strong> — ${formDisplayName(sub.type)} <strong>${sub.ref_no}</strong> is approved.</p>
        <p>Status: ${status.replace(/_/g, " ")}</p>
        ${note ? `<p>Conditions: ${note}</p>` : ""}
        <p>The matching gate pass is approved with this permit.</p>
        <p><a href="${verifyUrl}">Verify permit</a></p>`,
      attachments: [{ filename: `${sub.ref_no}-approved.pdf`, content: pdfBuf }],
    });
    await supabase.from("submissions").update({ approved_pdf_url: approvedPdfPath }).eq("id", id);
  } else {
    const recipients = uniqueAddresses([
      sub.contact_email,
      ...APPROVAL_CONTACTS,
      ...(settings?.ptw_standard_recipients ? String(settings.ptw_standard_recipients).split(",") : []),
    ]);
    await sendEmail({
      to: recipients,
      subject: `Not approved – ${sub.ref_no}`,
      html: `<p><strong>${sub.company_name}</strong> — ${formDisplayName(sub.type)} <strong>${sub.ref_no}</strong> was not approved.</p>
        <p><strong>Reason:</strong> ${note}</p>
        <p><a href="${site}">Submit again</a></p>`,
    });
  }
  } catch (error) {
    console.error("Decision saved, but the email or PDF did not finish", error);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
  return { ok: true as const, status };
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
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
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

export async function updateSubmissionFields(
  id: string,
  fields: {
    companyName: string;
    contactEmail: string;
    building: string;
    data: Record<string, string>;
  },
) {
  const { user } = await requireAdmin();
  const supabase = createServiceClient();
  const { data: sub } = await supabase
    .from("submissions")
    .select("data")
    .eq("id", id)
    .single();
  if (!sub) return { ok: false as const, error: "Not found" };
  const data = {
    ...((sub.data as Record<string, unknown>) ?? {}),
    ...fields.data,
  };
  await supabase
    .from("submissions")
    .update({
      company_name: fields.companyName,
      contact_email: fields.contactEmail,
      building: fields.building || null,
      data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  await supabase.from("audit_log").insert({
    submission_id: id,
    action: "edited",
    note: "Admin corrected form details",
    actor: user.email,
  });
  revalidatePath(`/admin/submissions/${id}`);
  return { ok: true as const };
}

export async function issueGatePass(
  permitId: string,
  input: {
    companyName: string;
    contactEmail: string;
    building: string;
    purpose: string;
    entryFrom: string;
    entryTo: string;
  },
) {
  const { user } = await requireAdmin();
  const supabase = createServiceClient();
  const { data: permit } = await supabase
    .from("submissions")
    .select("id, ref_no, type, owner_id, company_name, contact_email, building")
    .eq("id", permitId)
    .single();
  if (!permit) return { ok: false as const, error: "Permit not found" };
  if (permit.type === "gate_pass") {
    return { ok: false as const, error: "This record is already a gate pass." };
  }

  const { data: refNo, error: refErr } = await supabase.rpc("next_ref_no", {
    p_type: "gate_pass",
  });
  if (refErr || !refNo) return { ok: false as const, error: "Could not create a reference number." };

  const { data: row, error } = await supabase
    .from("submissions")
    .insert({
      type: "gate_pass",
      ref_no: refNo,
      status: "approved",
      company_name: input.companyName || permit.company_name,
      contact_email: input.contactEmail || permit.contact_email,
      building: input.building || permit.building,
      owner_id: permit.owner_id,
      linked_ref_no: permit.ref_no,
      approved_at: new Date().toISOString(),
      data: {
        purpose: input.purpose,
        entryFrom: input.entryFrom,
        entryTo: input.entryTo,
        issuedByAdmin: true,
        linkedPermitRef: permit.ref_no,
      },
    })
    .select("id, ref_no")
    .single();

  if (error || !row) return { ok: false as const, error: error?.message ?? "Could not issue gate pass." };

  await supabase.from("audit_log").insert({
    submission_id: row.id,
    action: "gate_pass_issued",
    note: `Issued from ${permit.ref_no}`,
    actor: user.email,
  });
  revalidatePath("/admin/submissions");
  return { ok: true as const, id: row.id as string, refNo: row.ref_no as string };
}

export async function saveWorkClassification(
  id: string,
  input: { workType: string[]; lightWorks: string[]; criticalWorks: string[] },
) {
  const { user } = await requireAdmin();
  const supabase = createServiceClient();
  const { data: current } = await supabase.from("submissions").select("data").eq("id", id).single();
  if (!current) return { ok: false as const, error: "Not found" };
  await supabase
    .from("submissions")
    .update({
      data: {
        ...((current.data as Record<string, unknown>) ?? {}),
        workType: input.workType,
        lightWorks: input.lightWorks,
        criticalWorks: input.criticalWorks,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  await supabase.from("audit_log").insert({
    submission_id: id,
    action: "ehsq_classification",
    note: input.workType.join(", ") || "Classification cleared",
    actor: user.email,
  });
  revalidatePath(`/admin/submissions/${id}`);
  return { ok: true as const };
}

export async function saveGatePass(
  id: string,
  input: { purpose: string; building: string; workers: { id: string; fullName: string; trade: string; mobile: string }[] },
) {
  const { user } = await requireAdmin();
  const supabase = createServiceClient();
  const { data: current } = await supabase.from("submissions").select("data, status").eq("id", id).single();
  if (!current) return { ok: false as const, error: "Not found" };
  if (!["draft", "pending"].includes(current.status)) {
    return { ok: false as const, error: "This gate pass is locked after approval. Use Amend to open a new revision." };
  }
  await supabase
    .from("submissions")
    .update({
      building: input.building,
      data: { ...((current.data as Record<string, unknown>) ?? {}), purpose: input.purpose },
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  for (const worker of input.workers) {
    await supabase.from("workers").update({ full_name: worker.fullName, trade: worker.trade, mobile: worker.mobile }).eq("id", worker.id);
  }
  await supabase.from("audit_log").insert({
    submission_id: id,
    action: "gate_pass_edited",
    note: "Company purpose, location, or workers updated before approval",
    actor: user.email,
  });
  revalidatePath("/admin/submissions");
  return { ok: true as const };
}
