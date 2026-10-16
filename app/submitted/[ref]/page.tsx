import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SubmittedPage({
  params,
  searchParams,
}: {
  params: { ref: string };
  searchParams: { type?: string };
}) {
  const ref = decodeURIComponent(params.ref);
  return (
    <SiteShell title="Submission received">
      <Card>
        <CardContent className="space-y-4 p-6 text-center">
          <p>Thank you. SMA Health &amp; Safety has received your form.</p>
          <p className="text-3xl font-bold text-sma-navy">{ref}</p>
          <p className="text-sm text-muted-foreground">Check your email for the PDF and reference. Approval emails go to lodhimehrose@gmail.com for review.</p>
          <Button asChild variant="outline"><Link href="/portal">Open my portal</Link></Button>
          {searchParams.type === "ptw_standard" && (
            <p className="text-sm">
              <Link href={`/gate-pass?permit=${encodeURIComponent(ref)}`} className="underline">Submit Gate Pass</Link> with worker EIDs.
            </p>
          )}
        </CardContent>
      </Card>
    </SiteShell>
  );
}
