import { redirect } from "next/navigation";
import { createAuthServerClient, createServiceClient } from "@/lib/supabase/server";

export type PortalUser = {
  id: string;
  email: string;
  name: string;
  company: string;
  phone: string;
};

export async function requirePortalUser(): Promise<PortalUser> {
  const auth = await createAuthServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user?.email) redirect("/portal/login");
  return {
    id: user.id,
    email: user.email,
    name: (user.user_metadata?.full_name as string | undefined) || user.email,
    company: (user.user_metadata?.company_name as string | undefined) || "",
    phone: (user.user_metadata?.phone as string | undefined) || "",
  };
}

export function submissionTypeLabel(type: string) {
  if (type === "gate_pass") return "Gate Pass";
  if (type === "ptw_emergency") return "Emergency PTW";
  return "Standard PTW";
}

export function statusNote(status: string) {
  const notes: Record<string, string> = {
    pending: "Received. The EHS officer has not decided yet.",
    approved: "Approved. You may proceed under the permit conditions.",
    approved_with_conditions: "Approved with conditions. Read the note before starting work.",
    rejected: "Not approved. See the decision note.",
    active: "Work is active under this permit.",
    closed: "This permit has been closed.",
    suspended: "Work is suspended until EHS lifts it.",
    cancelled: "This request was cancelled.",
    expired: "The permit period has ended.",
  };
  return notes[status] ?? "Status updated by EHS.";
}
