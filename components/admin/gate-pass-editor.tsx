"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveGatePass } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GatePassEditor({
  id,
  purpose,
  building,
  maxWorkers,
  workers,
}: {
  id: string;
  purpose: string;
  building: string;
  maxWorkers: number;
  workers: { id: string; full_name: string; trade: string; mobile: string; eid_expiry: string }[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const warning = workers.length > maxWorkers ? `Workers (${workers.length}) exceed the permit maximum (${maxWorkers}).` : "";

  async function onSubmit(formData: FormData) {
    setSaving(true);
    const result = await saveGatePass(id, {
      purpose: String(formData.get("purpose") ?? ""),
      building: String(formData.get("building") ?? ""),
      workers: workers.map((worker) => ({
        id: worker.id,
        fullName: String(formData.get(`name-${worker.id}`) ?? ""),
        trade: String(formData.get(`trade-${worker.id}`) ?? ""),
        mobile: String(formData.get(`mobile-${worker.id}`) ?? ""),
      })),
    });
    setSaving(false);
    setMessage(result.ok ? "Gate pass saved." : result.error);
    if (result.ok) router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <h3 className="font-semibold text-foreground">Edit gate pass before approval</h3>
      {warning && <p className="text-sm text-red-600">{warning}</p>}
      <div>
        <Label htmlFor="purpose">Purpose of visit</Label>
        <Input id="purpose" name="purpose" defaultValue={purpose} />
      </div>
      <div>
        <Label htmlFor="building">Location</Label>
        <Input id="building" name="building" defaultValue={building} />
      </div>
      {workers.map((worker) => (
        <div key={worker.id} className="grid gap-2 sm:grid-cols-3">
          <Input name={`name-${worker.id}`} defaultValue={worker.full_name} aria-label="Name" />
          <Input name={`trade-${worker.id}`} defaultValue={worker.trade} aria-label="Trade" />
          <Input name={`mobile-${worker.id}`} defaultValue={worker.mobile} aria-label="Mobile" />
        </div>
      ))}
      <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}
