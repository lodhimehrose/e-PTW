"use client";

import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function StatusPage() {
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<string | null>(null);

  async function check() {
    const res = await fetch("/api/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, email }),
    });
    const data = await res.json();
    setResult(data.message);
  }

  return (
    <SiteShell title="Check submission status">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div><Label>Reference</Label><Input value={ref} onChange={(e) => setRef(e.target.value)} /></div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <Button onClick={check}>Check</Button>
          {result && <p className="rounded bg-sma-grey p-3 text-sm font-medium">{result}</p>}
        </CardContent>
      </Card>
    </SiteShell>
  );
}
