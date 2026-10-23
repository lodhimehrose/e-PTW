"use server";

import { isAdminEmail } from "@/lib/auth";
import { cookies } from "next/headers";
import { createAuthServerClient, createServiceClient } from "@/lib/supabase/server";

export type SavedWorker = {
  fullName: string;
  trade: string;
  emiratesId: string;
  eidExpiry: string;
  mobile: string;
  expired: boolean;
  eidFileName: string;
  eidFilePath: string;
};

export type CompanyRoster = {
  companyName: string;
  contactEmail: string;
  tradeLicenseNo: string;
  department: string;
  applicantName: string;
  supervisorName: string;
  building: string;
};

async function attachEidFiles(
  supabase: ReturnType<typeof createServiceClient>,
  submissionIds: string[],
  workers: SavedWorker[],
) {
  if (!submissionIds.length || !workers.length) return workers;
  const { data: docs } = await supabase
    .from("documents")
    .select("file_name, file_url")
    .in("submission_id", submissionIds);
  return workers.map((worker) => {
    const match = (docs ?? []).find((doc) => {
      const name = String(doc.file_name || "");
      return /^eid-/i.test(name) && name.toLowerCase().includes(worker.fullName.trim().toLowerCase());
    });
    if (!match) return worker;
    return { ...worker, eidFileName: String(match.file_name || "Emirates ID"), eidFilePath: String(match.file_url || "") };
  });
}

export async function loadRoster() {
  const auth = await createAuthServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user?.email) return { ok: true as const, company: null, workers: [] as SavedWorker[] };

  let ownerId = user.id;
  if (isAdminEmail(user.email)) {
    const actAs = (await cookies()).get("sma_act_as")?.value;
    if (actAs) ownerId = actAs;
  }

  const supabase = createServiceClient();
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, company_name, contact_email, building, data, created_at")
    .or(`owner_id.eq.${ownerId},contact_email.eq.${user.email}`)
    .order("created_at", { ascending: false })
    .limit(30);

  const accountCompany = String((user.user_metadata as { company_name?: string } | undefined)?.company_name || "").trim().toLowerCase();
  const ownSubmissions = (submissions ?? []).filter((row) => {
    if (!accountCompany) return true;
    return String(row.company_name || "").trim().toLowerCase() === accountCompany;
  });

  const latest = ownSubmissions[0];
  const data = (latest?.data ?? {}) as Record<string, string>;
  const company: CompanyRoster | null = latest
    ? {
        companyName: latest.company_name || "",
        contactEmail: latest.contact_email || user.email,
        tradeLicenseNo: data.tradeLicenseNo || "",
        department: data.department || "",
        applicantName: data.applicantName || "",
        supervisorName: data.supervisorName || "",
        building: latest.building || "",
      }
    : null;

  const ids = ownSubmissions.map((row) => row.id);
  if (!ids.length) return { ok: true as const, company, workers: [] as SavedWorker[] };

  const { data: workerRows } = await supabase
    .from("workers")
    .select("full_name, trade, emirates_id, eid_expiry, mobile, created_at")
    .in("submission_id", ids)
    .order("created_at", { ascending: false });

  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set<string>();
  const workers: SavedWorker[] = [];
  for (const row of workerRows ?? []) {
    const emiratesId = String(row.emirates_id || "");
    if (!emiratesId || seen.has(emiratesId)) continue;
    seen.add(emiratesId);
    const eidExpiry = String(row.eid_expiry || "").slice(0, 10);
    workers.push({
      fullName: row.full_name,
      trade: row.trade,
      emiratesId,
      eidExpiry,
      mobile: row.mobile,
      expired: Boolean(eidExpiry) && eidExpiry < today,
      eidFileName: "",
      eidFilePath: "",
    });
  }

  return { ok: true as const, company, workers: await attachEidFiles(supabase, ids, workers) };
}

export type CompanyMatch = CompanyRoster & {
  workers: SavedWorker[];
};

export async function searchCompanies(query: string) {
  const name = query.trim().replace(/[%_]/g, "");
  if (name.length < 2) return { companies: [] as CompanyMatch[] };

  const auth = await createAuthServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user?.email) return { companies: [] as CompanyMatch[] };
  let ownerId = user.id;
  if (isAdminEmail(user.email)) {
    const actAs = (await cookies()).get("sma_act_as")?.value;
    if (actAs) ownerId = actAs;
  }

  const supabase = createServiceClient();
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, company_name, contact_email, building, data, created_at")
    .or(`owner_id.eq.${ownerId},contact_email.eq.${user.email}`)
    .ilike("company_name", `%${name}%`)
    .order("created_at", { ascending: false })
    .limit(40);

  const accountCompany = String((user.user_metadata as { company_name?: string } | undefined)?.company_name || "").trim().toLowerCase();
  const latest = new Map<string, NonNullable<typeof submissions>[number]>();
  for (const row of submissions ?? []) {
    if (accountCompany && String(row.company_name || "").trim().toLowerCase() !== accountCompany) continue;
    const key = (row.company_name || "").trim().toLowerCase();
    if (!key || latest.has(key)) continue;
    latest.set(key, row);
  }
  const chosen = Array.from(latest.values()).slice(0, 8);
  if (!chosen.length) return { companies: [] as CompanyMatch[] };

  const { data: workerRows } = await supabase
    .from("workers")
    .select("submission_id, full_name, trade, emirates_id, eid_expiry, mobile")
    .in("submission_id", chosen.map((row) => row.id));

  const today = new Date().toISOString().slice(0, 10);
  const companies: CompanyMatch[] = chosen.map((row) => {
    const data = (row.data ?? {}) as Record<string, string>;
    const seen = new Set<string>();
    const workers: SavedWorker[] = [];
    for (const worker of workerRows ?? []) {
      if (worker.submission_id !== row.id) continue;
      const emiratesId = String(worker.emirates_id || "");
      if (!emiratesId || seen.has(emiratesId)) continue;
      seen.add(emiratesId);
      const eidExpiry = String(worker.eid_expiry || "").slice(0, 10);
      workers.push({
        fullName: worker.full_name,
        trade: worker.trade,
        emiratesId,
        eidExpiry,
        mobile: worker.mobile,
        expired: Boolean(eidExpiry) && eidExpiry < today,
        eidFileName: "",
        eidFilePath: "",
      });
    }
    return {
      companyName: row.company_name || "",
      contactEmail: row.contact_email || "",
      tradeLicenseNo: data.tradeLicenseNo || "",
      department: data.department || "",
      applicantName: data.applicantName || "",
      supervisorName: data.supervisorName || "",
      building: row.building || "",
      workers,
    };
  });

  const withFiles = await attachEidFiles(supabase, chosen.map((row) => row.id), companies.flatMap((company) => company.workers));
  const byId = new Map(withFiles.map((worker) => [worker.emiratesId, worker]));
  return {
    companies: companies.map((company) => ({
      ...company,
      workers: company.workers.map((worker) => byId.get(worker.emiratesId) || worker),
    })),
  };
}
