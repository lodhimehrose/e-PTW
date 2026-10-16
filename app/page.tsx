import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { ClipboardList, HardHat, Siren, ArrowRight, ShieldCheck } from "lucide-react";

const forms = [
  {
    href: "/gate-pass",
    title: "Contractor Gate Pass",
    ref: "Form-08",
    desc: "Register workers, vehicles, and tools. A valid permit to work is required.",
    icon: ClipboardList,
  },
  {
    href: "/ptw/standard",
    title: "Standard Permit to Work",
    ref: "Form-07",
    desc: "Planned works. Submit at least 3 working days before the job starts.",
    icon: HardHat,
  },
  {
    href: "/ptw/emergency",
    title: "Emergency / Breakdown PTW",
    ref: "Form-07A",
    desc: "Urgent breakdowns that cannot wait for the standard notice period.",
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
              Choose a form, sign, and submit. You will receive a reference number. The EHS officer reviews every request.
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
            {["Pick the correct form", "Complete the details and sign", "Keep your reference number"].map((step, i) => (
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

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {forms.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="group flex flex-col rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-md hover:ring-sma-gold/60"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sma-navy text-sma-gold">
              <f.icon className="h-5 w-5" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-sma-gold">{f.ref}</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">{f.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{f.desc}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              Open form
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-sma-gold" />
        Sharjah Maritime Academy · Khorfakkan
      </p>
    </SiteShell>
  );
}
