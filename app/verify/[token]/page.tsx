import { createServiceClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/site-shell";
import { maskEmiratesId, isEidExpired } from "@/lib/mask-eid";

export default async function VerifyPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createServiceClient();
  const { data: sub } = await supabase
    .from("submissions")
    .select("*, workers(*)")
    .eq("verify_token", params.token)
    .maybeSingle();

  if (!sub) {
    return (
      <SiteShell title="Permit verification">
        <p className="text-center text-red-600 font-bold">NOT VALID</p>
      </SiteShell>
    );
  }

  const now = new Date();
  const validStatuses = ["approved", "approved_with_conditions", "active"];
  const expired =
    sub.end_at && new Date(sub.end_at) < now || sub.status === "expired";
  const valid = validStatuses.includes(sub.status) && !expired;

  return (
    <SiteShell title="Permit verification">
      <div className="rounded-lg border bg-white p-6 text-center">
        <p
          className={`text-3xl font-bold ${valid ? "text-green-600" : expired ? "text-gray-500" : "text-red-600"}`}
        >
          {valid ? "VALID" : expired ? "EXPIRED" : "NOT VALID"}
        </p>
        <p className="mt-4 text-lg font-semibold text-sma-navy">{sub.ref_no}</p>
        <p>{sub.company_name}</p>
        <p className="text-sm text-muted-foreground">
          {sub.start_at?.slice(0, 16)} — {sub.end_at?.slice(0, 16)}
        </p>
        <p className="text-sm">Max workers: {sub.max_workers ?? "—"}</p>
        <p className="mt-2 capitalize">Status: {sub.status.replace(/_/g, " ")}</p>
        <div className="mt-6 text-left">
          <p className="font-medium">Workers</p>
          <ul className="mt-2 space-y-2 text-sm">
            {(sub.workers ?? []).map((w: { full_name: string; emirates_id: string; eid_expiry: string }) => (
              <li
                key={w.emirates_id}
                className="flex justify-between rounded bg-slate-50 px-3 py-2"
              >
                <span>{w.full_name}</span>
                <span>
                  {maskEmiratesId(w.emirates_id)}
                  <span
                    className={`ml-2 rounded px-1 text-xs ${isEidExpired(w.eid_expiry) ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                  >
                    {isEidExpired(w.eid_expiry) ? "EID expired" : "EID valid"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SiteShell>
  );
}
