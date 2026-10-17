"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin, createServiceClient } from "@/lib/supabase/server";

export async function openContractorAccount(userId: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data.user?.email) {
    return { ok: false as const, error: "That account could not be opened." };
  }
  const cookieStore = await cookies();
  cookieStore.set("sma_act_as", data.user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/portal");
}

export async function exitContractorAccount() {
  await requireAdmin();
  const cookieStore = await cookies();
  cookieStore.delete("sma_act_as");
  redirect("/admin");
}
