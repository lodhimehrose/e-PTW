"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isAdminEmail } from "@/lib/auth";
import { createAuthServerClient, createServiceClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const auth = await createAuthServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { ok: false as const, error: "Sign in again to update your profile." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const company = String(formData.get("company_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!fullName || !company) {
    return { ok: false as const, error: "Name and company are required." };
  }

  const actAs = (await cookies()).get("sma_act_as")?.value;
  if (actAs && isAdminEmail(user.email)) {
    const admin = createServiceClient();
    const { error } = await admin.auth.admin.updateUserById(actAs, {
      user_metadata: { full_name: fullName, company_name: company, phone },
    });
    if (error) return { ok: false as const, error: error.message };
    revalidatePath("/portal");
    revalidatePath("/portal/profile");
    return { ok: true as const };
  }

  const { error } = await auth.auth.updateUser({
    data: { full_name: fullName, company_name: company, phone },
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/portal");
  revalidatePath("/portal/profile");
  return { ok: true as const };
}

export async function updatePassword(formData: FormData) {
  const auth = await createAuthServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { ok: false as const, error: "Sign in again to change your password." };
  const actAs = (await cookies()).get("sma_act_as")?.value;
  if (actAs && isAdminEmail(user.email)) {
    return { ok: false as const, error: "Only the account owner can change this password." };
  }

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 6) {
    return { ok: false as const, error: "Use at least 6 characters." };
  }
  if (password !== confirm) {
    return { ok: false as const, error: "The two passwords do not match." };
  }

  const { error } = await auth.auth.updateUser({ password });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
