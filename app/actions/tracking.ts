"use server";

import { isAdminEmail } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { statusNote, submissionTypeLabel } from "@/lib/portal";
import { createdAtBounds, isDateInput } from "@/lib/date-range";
import { createAuthServerClient, createServiceClient } from "@/lib/supabase/server";

export type TrackedSubmission = {
  id: string;
  refNo: string;
  type: string;
  typeLabel: string;
  company: string;
  status: string;
  note: string;
  decisionNote: string;
  building: string;
  createdAt: string;
  href: string | null;
};

export async function trackByEmail(email: string, from?: string, to?: string) {
  const auth = await createAuthServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user?.email) {
    return { ok: false as const, error: "Sign in to track an application." };
  }
  if (!checkRateLimit(`track:${user.id}`, 20, 60_000)) {
    return { ok: false as const, error: "Too many lookups. Try again in a minute." };
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@") || normalized.includes("%") || normalized.includes("_")) {
    return { ok: false as const, error: "Enter a valid email address." };
  }

  const { start, end } = createdAtBounds(from, to);
  if ((from && !isDateInput(from)) || (to && !isDateInput(to))) {
    return { ok: false as const, error: "Use a valid from and to date." };
  }

  const admin = isAdminEmail(user.email);
  const supabase = createServiceClient();
  let query = supabase
    .from("submissions")
    .select("id, ref_no, type, company_name, status, created_at, building, decision_note, contact_email, owner_id")
    .ilike("contact_email", normalized)
    .order("created_at", { ascending: false });
  if (start) query = query.gte("created_at", start);
  if (end) query = query.lte("created_at", end);
  const { data, error } = await query;
  if (error) return { ok: false as const, error: "Could not look up that email." };

  const rows: TrackedSubmission[] = (data ?? []).map((row) => {
    const owns =
      admin ||
      row.owner_id === user.id ||
      row.contact_email?.toLowerCase() === user.email?.toLowerCase();
    return {
      id: row.id as string,
      refNo: row.ref_no as string,
      type: row.type as string,
      typeLabel: submissionTypeLabel(row.type as string),
      company: (row.company_name as string) || "—",
      status: row.status as string,
      note: statusNote(row.status as string),
      decisionNote: (row.decision_note as string) || "",
      building: (row.building as string) || "—",
      createdAt: row.created_at as string,
      href: admin
        ? `/admin/submissions/${row.id}`
        : owns
          ? `/portal/track/${encodeURIComponent(row.ref_no as string)}`
          : null,
    };
  });

  return { ok: true as const, rows };
}
