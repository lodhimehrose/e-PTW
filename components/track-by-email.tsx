"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { trackByEmail, type TrackedSubmission } from "@/app/actions/tracking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/status-badge";

export function TrackByEmail({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [rows, setRows] = useState<TrackedSubmission[] | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await trackByEmail(email, from || undefined, to || undefined);
    setPending(false);
    if (!result.ok) {
      setRows(null);
      setError(result.error);
      return;
    }
    setRows(result.rows);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-5">
        <Label htmlFor="track-email">Email on the application</Label>
        <div className="mt-2">
          <Input
            id="track-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="track-from">From</Label>
            <Input id="track-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="track-to">To</Label>
            <Input id="track-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </div>
        </div>
        <Button type="submit" className="mt-3" disabled={pending}>
          {pending ? "Looking up…" : "Track status"}
        </Button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </form>

      {rows && rows.length === 0 && (
        <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          No applications were found for that email.
        </p>
      )}

      {rows && rows.length > 0 && (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-sma-gold">{row.typeLabel}</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{row.refNo}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.company} · {row.building}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {format(new Date(row.createdAt), "dd MMM yyyy, HH:mm")}
                  </p>
                </div>
                <StatusBadge status={row.status} urgent={row.type === "ptw_emergency"} />
              </div>
              <p className="mt-3 text-sm text-foreground">{row.note}</p>
              {row.decisionNote && (
                <p className="mt-2 text-sm text-muted-foreground">Note: {row.decisionNote}</p>
              )}
              {row.href && (
                <Link href={row.href} className="mt-3 inline-block text-sm font-medium underline">
                  Open this application
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
