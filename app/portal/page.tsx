import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ClipboardList, HardHat, Siren } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { SignOutButton } from "@/components/sign-out-button";
import { StatusBadge } from "@/components/status-badge";
import { createAuthServerClient, createServiceClient } from "@/lib/supabase/server";

const forms = [
  { href: "/gate-pass", title: "Gate Pass", ref: "Form-08", icon: ClipboardList },
  { href: "/ptw/standard", title: "Standard PTW", ref: "Form-07", icon: HardHat },
  { href: "/ptw/emergency", title: "Emergency PTW", ref: "Form-07A", icon: Siren },
];

export default async function PortalPage() {
  const auth = await createAuthServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user?.email) redirect("/portal/login");

  const name =
    (user.user_metadata?.full_name as string | undefined) || user.email;
  const company = user.user_metadata?.company_name as string | undefined;

  const supabase = createServiceClient();
  const { data: rows, error } = await supabase
    .from("submissions")
    .select("id, ref_no, type, company_name, status, created_at")
    .or(`owner_id.eq.${user.id},contact_email.ilike.${user.email}`)
    .order("created_at", { ascending: false });

  return (
    <SiteShell title="Your portal">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{company || user.email}</p>
        </div>
        <SignOutButton redirectTo="/portal/login" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {forms.map((form) => (
          <Link
            key={form.href}
            href={form.href}
            className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border hover:ring-sma-gold/60"
          >
            <form.icon className="h-5 w-5 text-sma-gold" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-sma-gold">{form.ref}</p>
            <p className="mt-1 font-semibold text-foreground">{form.title}</p>
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h2 className="text-lg font-semibold text-foreground">Your submissions</h2>
        {error && (
          <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
            The portal needs one database update. In Supabase, open SQL Editor and run
            supabase/migrations/003_submitter_portal.sql, then refresh this page.
          </p>
        )}
        {!error && !rows?.length && (
          <p className="mt-4 text-sm text-muted-foreground">
            No submissions yet. Open a form above. Anything you send while signed in appears here.
          </p>
        )}
        <div className="mt-4 space-y-2">
          {(rows ?? []).map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
            >
              <div>
                <p className="font-medium text-foreground">{row.ref_no}</p>
                <p className="text-xs text-muted-foreground">
                  {row.company_name || row.type} · {format(new Date(row.created_at), "d MMM yyyy")}
                </p>
              </div>
              <StatusBadge status={row.status} urgent={row.type === "ptw_emergency"} />
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
