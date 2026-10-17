import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SubmittedPage({
  params,
}: {
  params: { ref: string };
}) {
  const ref = decodeURIComponent(params.ref);
  return (
    <SiteShell title="Submission received">
      <Card>
        <CardContent className="space-y-4 p-6 text-center">
          <p>Thank you. SMA Health &amp; Safety has received your form.</p>
          <p className="text-3xl font-bold text-sma-navy">{ref}</p>
          <p className="text-sm text-muted-foreground">
            EHS has the application at ehs@sma.ac.ae. The gate pass uses the same company and worker details and is approved with this permit.
          </p>
          <Button asChild variant="outline"><Link href={`/portal/track/${ref}`}>Download the PDF</Link></Button>
        </CardContent>
      </Card>
    </SiteShell>
  );
}
