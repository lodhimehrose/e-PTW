"use server";

import { createAuthServerClient, createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { uploadBuffer } from "@/lib/storage";

export type AccountProfile = {
  companyName: string;
  tradeLicenseNo: string;
  tradeLicenseExpiry: string;
  email: string;
  tradeLicenseName: string;
  tradeLicensePath: string;
};

export async function loadAccountProfile(): Promise<AccountProfile | null> {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, string>;
  return {
    companyName: meta.company_name || "",
    tradeLicenseNo: meta.trade_license_no || "",
    tradeLicenseExpiry: meta.trade_license_expiry || "",
    email: user.email || "",
    tradeLicenseName: meta.trade_license_name || "",
    tradeLicensePath: meta.trade_license_path || "",
  };
}

export async function registerContractor(input: {
  companyName: string;
  tradeLicenseNo: string;
  tradeLicenseExpiry: string;
  email: string;
  password: string;
  tradeLicense: { name: string; type: string; base64: string };
  nextPath?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase();
  if (!input.companyName.trim() || !input.tradeLicenseNo.trim() || !input.tradeLicenseExpiry) {
    return { ok: false as const, error: "Company, trade license number, and expiry are required." };
  }
  if (input.tradeLicenseExpiry < new Date().toISOString().slice(0, 10)) {
    return { ok: false as const, error: "That trade license is expired." };
  }
  if (!input.tradeLicense?.base64) return { ok: false as const, error: "Upload the trade license." };
  if (email === adminEmail) return { ok: false as const, error: "This email is reserved for the EHS officer." };
  if (input.password.length < 6) return { ok: false as const, error: "Use at least 6 characters for the password." };

  const admin = createServiceClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password: input.password,
    options: {
      data: {
        company_name: input.companyName.trim(),
        trade_license_no: input.tradeLicenseNo.trim(),
        trade_license_expiry: input.tradeLicenseExpiry,
      },
    },
  });
  if (error || !data.user) {
    const message = error?.message || "Could not create the account.";
    if (/already|registered|exists/i.test(message)) {
      return { ok: false as const, error: "An account with this email already exists. Sign in instead." };
    }
    return { ok: false as const, error: message };
  }

  const ext = input.tradeLicense.name.includes(".")
    ? input.tradeLicense.name.slice(input.tradeLicense.name.lastIndexOf(".")).toLowerCase()
    : "";
  const path = `accounts/${data.user.id}/trade-license${ext || ".pdf"}`;
  await uploadBuffer(path, Buffer.from(input.tradeLicense.base64, "base64"), input.tradeLicense.type || "application/pdf");
  await admin.auth.admin.updateUserById(data.user.id, {
    user_metadata: {
      company_name: input.companyName.trim(),
      trade_license_no: input.tradeLicenseNo.trim(),
      trade_license_expiry: input.tradeLicenseExpiry,
      trade_license_path: path,
      trade_license_name: input.tradeLicense.name,
    },
  });

  const token = data.properties?.hashed_token;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://sma-epermit.vercel.app";
  const nextPath = input.nextPath?.startsWith("/") ? input.nextPath : "/portal";
  if (!token) return { ok: false as const, error: "Account was created, but the verification link could not be made." };
  const link = `${site}/auth/confirm?token_hash=${encodeURIComponent(token)}&type=signup&next=${encodeURIComponent(nextPath)}`;
  const sent = await sendEmail({
    to: email,
    subject: "Verify your SMA e-Permit account",
    html: `<p>Your contractor account for <strong>${input.companyName.trim()}</strong> is ready.</p>
      <p><a href="${link}">Verify email</a></p>
      <p>This link opens the SMA e-Permit Portal and confirms your email.</p>`,
  });
  if (!sent.ok && "skipped" in sent && sent.skipped) {
    return { ok: true as const, notice: "Account created. Email delivery is not configured yet, so sign in with the password you chose." };
  }
  if (!sent.ok) return { ok: false as const, error: "Account created, but the verification email could not be sent." };
  return { ok: true as const, notice: "Check your email and click Verify email. The link stays on this portal." };
}
