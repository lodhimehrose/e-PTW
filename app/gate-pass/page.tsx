import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function GatePassPage() {
  return (
    <SiteShell title="Gate pass">
      <div className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h1 className="text-2xl font-semibold text-foreground">The gate pass is created with the permit</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          You do not fill a separate gate pass or a permit reference. Complete the Standard PTW or the Emergency breakdown PTW. The matching gate pass is saved from the company, dates, and workers on that form, and it is approved when EHS approves the permit.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/ptw/standard" className="rounded-full bg-sma-navy px-4 py-2 font-medium text-white">
            Standard PTW
          </Link>
          <Link href="/ptw/emergency" className="rounded-full border border-border px-4 py-2 font-medium text-foreground">
            Emergency breakdown PTW
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
