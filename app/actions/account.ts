"use server";

import { createAuthServerClient, createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { uploadBuffer } from "@/lib/storage";

export type AccountProfile = {
  companyName: string;
  tradeLicenseNo: string;
  tradeLicenseExpiry: string;
  email: string;
  tradeLicenseNames: string[];
  tradeLicensePaths: string[];
};

function textList(value: unknown, single: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof single === "string" && single) return [single];
  return [];
}

export async function loadAccountProfile(): Promise<AccountProfile | null> {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createServiceClient();
  let freshMeta: Record<string, unknown> = {};
  try {
    const { data: fresh } = await admin.auth.admin.getUserById(user.id);
    freshMeta = (fresh.user?.user_metadata ?? {}) as Record<string, unknown>;
  } catch {
    freshMeta = {};
  }
  const meta = {
    ...((user.user_metadata ?? {}) as Record<string, unknown>),
    ...freshMeta,
  };
  let companyName = String(meta.company_name || "");
  let tradeLicenseNo = String(meta.trade_license_no || meta.tradeLicenseNo || "");
  let tradeLicenseExpiry = String(meta.trade_license_expiry || meta.tradeLicenseExpiry || "");
  let tradeLicensePaths = textList(meta.trade_license_paths, meta.trade_license_path);
  let tradeLicenseNames = textList(meta.trade_license_names, meta.trade_license_name);
  if (!tradeLicensePaths.length) {
    const listed = await admin.storage.from("submissions").list(`accounts/${user.id}`);
    const files = (listed.data ?? []).filter((file) => file.name && !file.name.endsWith("/"));
    tradeLicensePaths = files.map((file) => `accounts/${user.id}/${file.name}`);
    tradeLicenseNames = files.map((file) => file.name);
  }

  if (!tradeLicenseNo || !tradeLicenseExpiry || !tradeLicensePaths.length) {
    const columns = "id, data, company_name";
    const lookups = [
      admin.from("submissions").select(columns).eq("owner_id", user.id).order("created_at", { ascending: false }).limit(8),
      admin.from("submissions").select(columns).eq("contact_email", user.email).order("created_at", { ascending: false }).limit(8),
    ];
    const found = await Promise.all(lookups);
    const seen = new Set<string>();
    const rows = found.flatMap((result) => result.data ?? []).filter((row) => {
      if (!row.id || seen.has(row.id)) return false;
      if (companyName && String(row.company_name || "").trim().toLowerCase() !== companyName.trim().toLowerCase()) return false;
      seen.add(row.id);
      return true;
    });
    let matchedId = "";
    for (const row of rows) {
      const saved = (row.data ?? {}) as Record<string, unknown>;
      if (!companyName && row.company_name) companyName = String(row.company_name);
      if (!tradeLicenseNo && saved.tradeLicenseNo) {
        tradeLicenseNo = String(saved.tradeLicenseNo);
        matchedId = String(row.id);
      }
      if (!tradeLicenseExpiry && saved.tradeLicenseExpiry) tradeLicenseExpiry = String(saved.tradeLicenseExpiry);
    }
    if (!tradeLicensePaths.length && rows.length) {
      const { data: docs } = await admin
        .from("documents")
        .select("submission_id, file_url, file_name")
        .in("submission_id", rows.map((row) => row.id));
      const licenses = (docs ?? []).filter((doc) => /trade-license/i.test(String(doc.file_name || "")) || /trade-license/i.test(String(doc.file_url || "")));
      const preferred = matchedId ? licenses.filter((doc) => doc.submission_id === matchedId) : licenses;
      const chosen = (preferred.length ? preferred : licenses).slice(0, 8);
      tradeLicensePaths = chosen.map((doc) => String(doc.file_url)).filter(Boolean);
      tradeLicenseNames = chosen.map((doc) => String(doc.file_name || "Trade license"));
    }
    if (tradeLicenseNo && !meta.trade_license_no) {
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...meta,
          company_name: companyName,
          trade_license_no: tradeLicenseNo,
          trade_license_expiry: tradeLicenseExpiry,
          trade_license_path: tradeLicensePaths[0] || "",
          trade_license_name: tradeLicenseNames[0] || "",
          trade_license_paths: tradeLicensePaths,
          trade_license_names: tradeLicenseNames,
        },
      });
    }
  }

  return {
    companyName,
    tradeLicenseNo,
    tradeLicenseExpiry,
    email: user.email || "",
    tradeLicenseNames,
    tradeLicensePaths,
  };
}

export async function registerContractor(input: {
  companyName: string;
  tradeLicenseNo: string;
  tradeLicenseExpiry: string;
  email: string;
  password: string;
  tradeLicenses: { name: string; type: string; base64: string }[];
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
  const licenses = (input.tradeLicenses ?? []).filter((file) => file.base64);
  if (!licenses.length) return { ok: false as const, error: "Upload the trade license." };
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

  const paths: string[] = [];
  const names: string[] = [];
  for (let index = 0; index < licenses.length; index += 1) {
    const file = licenses[index];
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : ".pdf";
    const path = `accounts/${data.user.id}/trade-license-${index + 1}${ext}`;
    await uploadBuffer(path, Buffer.from(file.base64, "base64"), file.type || "application/pdf");
    paths.push(path);
    names.push(file.name);
  }
  await admin.auth.admin.updateUserById(data.user.id, {
    user_metadata: {
      company_name: input.companyName.trim(),
      trade_license_no: input.tradeLicenseNo.trim(),
      trade_license_expiry: input.tradeLicenseExpiry,
      trade_license_path: paths[0],
      trade_license_name: names[0],
      trade_license_paths: paths,
      trade_license_names: names,
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
