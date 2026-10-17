"use server";

import { cookies } from "next/headers";
import { isAdminEmail } from "@/lib/auth";
import { createServiceClient, createAuthServerClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import { uploadBuffer, uploadDataUrl } from "@/lib/storage";
import { renderSubmissionPdf } from "@/lib/pdf/render";
import { formDisplayName, sendEmail } from "@/lib/email/send";
import { randomUUID } from "crypto";

const ALLOWED_UPLOADS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".heic",
  ".tif",
  ".tiff",
]);

const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".csv": "text/csv",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".heic": "image/heic",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
};

function splitEmails(value: string | null | undefined) {
  return (value ?? "")
    .split(/[,;\n]+/)
    .map((email) => email.trim())
    .filter((email) => email.includes("@"));
}

function uniqueEmails(values: Array<string | undefined>) {
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

export type FilePayload = {
  name: string;
  type: string;
  base64: string;
};

export type SubmitPayload = {
  type: "gate_pass" | "ptw_standard" | "ptw_emergency";
  honeypot?: string;
  companyName: string;
  contactEmail: string;
  building?: string;
  startAt?: string;
  endAt?: string;
  maxWorkers?: number;
  linkedRefNo?: string;
  data: Record<string, unknown>;
  signatureDataUrl?: string;
  documents?: FilePayload[];
  workers?: Array<{
    fullName: string;
    trade: string;
    emiratesId: string;
    eidExpiry: string;
    mobile: string;
    inductionDone?: boolean;
  }>;
  vehicles?: Array<Record<string, unknown>>;
  tools?: Array<Record<string, unknown>>;
};

export async function submitForm(payload: SubmitPayload) {
  if (payload.honeypot) {
    return { ok: false as const, error: "Submission rejected." };
  }

  if (!checkRateLimit("submit:public")) {
    return { ok: false as const, error: "Too many requests. Try again shortly." };
  }

  const supabase = createServiceClient();
  let ownerId: string | null = null;
  try {
    const auth = await createAuthServerClient();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (user) {
      ownerId = user.id;
      if (isAdminEmail(user.email)) {
        const actAs = (await cookies()).get("sma_act_as")?.value;
        if (actAs) ownerId = actAs;
      }
    }
  } catch {
    ownerId = null;
  }

  const { data: refNo, error: refErr } = await supabase.rpc("next_ref_no", {
    p_type: payload.type,
  });

  if (refErr || !refNo) {
    console.error(refErr);
    return { ok: false as const, error: "Could not generate reference number." };
  }

  const storedData = { ...payload.data };
  delete storedData.uploads;
  delete storedData.documents;
  delete storedData.signatureDataUrl;
  delete storedData.honeypot;

  const { data: row, error } = await supabase
    .from("submissions")
    .insert({
      type: payload.type,
      ref_no: refNo,
      status: "pending",
      company_name: payload.companyName,
      contact_email: payload.contactEmail,
      building: payload.building ?? null,
      start_at: payload.startAt ?? null,
      end_at: payload.endAt ?? null,
      max_workers: payload.maxWorkers ?? null,
      linked_ref_no: payload.linkedRefNo ?? null,
      owner_id: ownerId,
      data: storedData,
      verify_token: randomUUID(),
    })
    .select("id, ref_no")
    .single();

  if (error || !row) {
    console.error(error);
    return { ok: false as const, error: "Could not save submission." };
  }

  const submissionId = row.id as string;

  if (payload.signatureDataUrl) {
    const sigPath = `${submissionId}/signature.png`;
    await uploadDataUrl(sigPath, payload.signatureDataUrl);
    await supabase
      .from("submissions")
      .update({ signature_url: sigPath })
      .eq("id", submissionId);
  }

  if (payload.documents?.length) {
    for (const doc of payload.documents) {
      const ext = doc.name.includes(".") ? doc.name.slice(doc.name.lastIndexOf(".")).toLowerCase() : "";
      if (!ALLOWED_UPLOADS.has(ext)) {
        return { ok: false as const, error: `${doc.name} is not an allowed file. Use PDF, Word, Excel, or a picture.` };
      }
      try {
        const buf = Buffer.from(doc.base64, "base64");
        const safe = doc.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${submissionId}/docs/${randomUUID()}-${safe}`;
        await uploadBuffer(path, buf, doc.type || MIME_BY_EXT[ext] || "application/octet-stream");
        await supabase.from("documents").insert({
          submission_id: submissionId,
          doc_type: ext.replace(".", "") || "upload",
          file_url: path,
          file_name: doc.name,
        });
      } catch (uploadError) {
        console.error(uploadError);
        return { ok: false as const, error: `Could not save ${doc.name}. Try a smaller PDF, Word, Excel, or picture file.` };
      }
    }
  }

  if (payload.workers?.length) {
    await supabase.from("workers").insert(
      payload.workers.map((w) => ({
        submission_id: submissionId,
        full_name: w.fullName,
        trade: w.trade,
        emirates_id: w.emiratesId,
        eid_expiry: w.eidExpiry,
        mobile: w.mobile,
        induction_done: w.inductionDone ?? false,
      })),
    );
  }

  if (payload.vehicles?.length) {
    await supabase.from("vehicles").insert(
      payload.vehicles.map((v) => ({
        submission_id: submissionId,
        vehicle_type: v.vehicleType as string,
        plate_no: v.plateNo as string,
        emirate: v.emirate as string,
        driver_name: v.driverName as string,
        license_no: v.licenseNo as string,
        license_expiry: v.licenseExpiry as string,
      })),
    );
  }

  if (payload.tools?.length) {
    await supabase.from("tools").insert(
      payload.tools.map((t) => ({
        submission_id: submissionId,
        description: t.description as string,
        quantity: t.quantity as string,
        serial_id: t.serialId as string,
      })),
    );
  }

  const { data: workers } = await supabase
    .from("workers")
    .select("*")
    .eq("submission_id", submissionId);

  const pdfBuf = await renderSubmissionPdf({
    refNo,
    type: payload.type,
    formTitle: formDisplayName(payload.type),
    companyName: payload.companyName,
    status: "pending",
    data: payload.data,
    workers: workers ?? [],
  });

  const pdfPath = `${submissionId}/submitted.pdf`;
  await uploadBuffer(pdfPath, pdfBuf, "application/pdf");
  await supabase
    .from("submissions")
    .update({ pdf_url: pdfPath })
    .eq("id", submissionId);

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const formName = formDisplayName(payload.type);
  const urgent = payload.type === "ptw_emergency" ? "URGENT – " : "";

  await sendEmail({
    to: payload.contactEmail,
    subject: `${urgent}We received your ${formName} – Ref ${refNo}`,
    html: `<p>Thank you. Your submission <strong>${refNo}</strong> is <strong>Pending</strong> review.</p>
      <p><a href="${site}/portal/status">Track this application by email</a></p>`,
    attachments: [{ filename: `${refNo}.pdf`, content: pdfBuf }],
  });

  const { data: settings } = await supabase
    .from("settings")
    .select("gate_pass_recipients, ptw_standard_recipients, ptw_emergency_recipients")
    .limit(1)
    .maybeSingle();
  const configured =
    payload.type === "gate_pass"
      ? settings?.gate_pass_recipients
      : payload.type === "ptw_emergency"
        ? settings?.ptw_emergency_recipients
        : settings?.ptw_standard_recipients;
  const receivers = uniqueEmails([
    process.env.ADMIN_EMAIL,
    ...splitEmails(configured),
  ]);
  for (const to of receivers) {
    await sendEmail({
      to,
      subject: `${urgent}New ${formName} – ${payload.companyName} – ${refNo}`,
      html: `<p><strong>${payload.companyName}</strong> submitted a ${formName}.</p>
        <p>Reference: <strong>${refNo}</strong></p>
        <p>Contact: ${payload.contactEmail}</p>
        <p>Location: ${payload.building ?? "—"}</p>
        <p>Attached files: ${payload.documents?.length ?? 0}</p>
        <p><a href="${site}/admin/submissions/${submissionId}">Open this submission</a></p>`,
      attachments: [{ filename: `${refNo}.pdf`, content: pdfBuf }],
    });
  }

  await supabase.from("audit_log").insert({
    submission_id: submissionId,
    action: "submitted",
    note: "Contractor submission received",
    actor: payload.contactEmail,
  });

  revalidatePath("/admin");
  return { ok: true as const, refNo: row.ref_no as string, id: submissionId };
}

export async function lookupPermitRef(refNo: string) {
  const supabase = createServiceClient();
  const normalized = refNo.trim().toUpperCase();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("ref_no", normalized)
    .in("type", ["ptw_standard", "ptw_emergency"])
    .maybeSingle();

  if (error || !data) {
    return { ok: false as const, error: "Permit not found." };
  }

  const allowed = ["pending", "approved", "approved_with_conditions", "active"];
  if (!allowed.includes(data.status)) {
    return { ok: false as const, error: "Linked permit is not valid for gate pass." };
  }

  if (data.end_at && new Date(data.end_at) < new Date()) {
    return { ok: false as const, error: "Linked permit has expired." };
  }

  return {
    ok: true as const,
    permit: {
      refNo: data.ref_no,
      type: data.type as string,
      companyName: data.company_name,
      building: data.building,
      startAt: data.start_at,
      endAt: data.end_at,
      maxWorkers: data.max_workers,
    },
  };
}
