import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, HardHat, Siren } from "lucide-react";

const forms = [
  { href: "/gate-pass", title: "Contractor Gate Pass", ref: "Form-08", desc: "Workers, vehicles and tools (requires PTW).", icon: ClipboardList },
  { href: "/ptw/standard", title: "Standard Permit to Work", ref: "Form-07", desc: "Planned works — 3 working days notice.", icon: HardHat },
  { href: "/ptw/emergency", title: "Emergency / Breakdown PTW", ref: "Form-07A", desc: "Urgent breakdowns.", icon: Siren },
];

export default function HomePage() {
  return (
    <SiteShell>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-sma-navy">SMA e-Permit Portal</h1>
        <p className="mt-2 text-muted-foreground">Sharjah Maritime Academy — Khorfakkan</p>
      </div>
      <Card className="mb-8">
        <CardHeader><CardTitle className="text-base">How it works</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Complete a form, sign, and submit. You receive a reference number and email.</p>
          <p>EHS reviews in the admin panel. <Link href="/status" className="underline text-sma-navy">Track status</Link></p>
          <p><Link href="/admin/login" className="underline text-sma-navy">EHS admin login</Link></p>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {forms.map((f) => (
          <Link key={f.href} href={f.href}>
            <Card className="hover:shadow-md transition">
              <CardContent className="flex gap-4 p-6 items-start">
                <f.icon className="h-8 w-8 text-sma-gold" />
                <div className="flex-1">
                  <h2 className="font-semibold text-sma-navy">{f.title}</h2>
                  <p className="text-xs text-muted-foreground">{f.ref}</p>
                  <p className="text-sm mt-1">{f.desc}</p>
                </div>
                <Button variant="secondary">Open</Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
