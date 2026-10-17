import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { HardHat, Siren, ArrowRight, ShieldCheck } from "lucide-react";

const permits = [
  {
    href: "/ptw/standard",
    title: "Standard PTW",
    ref: "Form-07",
    desc: "Planned work. Submit at least 3 working days before the job starts. The contractor gate pass is created from this form.",
    icon: HardHat,
  },
  {
    href: "/ptw/emergency",
    title: "Emergency breakdown PTW",
    ref: "Form-07A",
    desc: "Unplanned breakdowns that cannot wait for the standard notice period. The emergency gate pass is created from this form.",
    icon: Siren,
  },
];

export default function HomePage() {
  return (
    <SiteShell>
      <section className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
        <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1.4fr_0.8fr] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sma-gold">Health, Safety & Environment</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              SMA e-Permit Portal
            </h1>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              Choose a permit, complete the company and worker details, and sign. EHS receives the application at ehs@sma.ac.ae.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link href="/portal/signup" className="rounded-full border border-border px-4 py-2 font-medium text-foreground hover:bg-muted">
                Create an account
              </Link>
              <Link href="/portal" className="rounded-full px-4 py-2 font-medium text-foreground/80 hover:bg-muted">
                My portal
              </Link>
            </div>
          </div>
          <ol className="space-y-3 rounded-2xl bg-muted p-5 text-sm text-foreground">
            {["Open the Permit card", "Choose standard or emergency", "Your gate pass is created with the permit"].map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sma-navy text-xs font-semibold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="permit" className="mt-8 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sma-gold">Permit</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">Choose the permit for this job</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {permits.map((permit) => (
            <Link
              key={permit.href}
              href={permit.href}
              className="group flex flex-col rounded-2xl border border-border p-5 transition hover:-translate-y-0.5 hover:ring-1 hover:ring-sma-gold/60"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sma-navy text-sma-gold">
                <permit.icon className="h-5 w-5" />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-sma-gold">{permit.ref}</p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">{permit.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{permit.desc}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                Open form
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-sma-gold" />
        Sharjah Maritime Academy · Khorfakkan
      </p>
    </SiteShell>
  );
}
