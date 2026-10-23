"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAdminSignatures } from "@/app/actions/admin";
import { SignaturePadField } from "@/components/signature-pad";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { notify } from "@/components/notice-bar";

const ROLES = [
  { nameKey: "fmName", signKey: "fmSignature", designation: "FM" },
  { nameKey: "securityName", signKey: "securitySignature", designation: "Security Supervisor" },
  { nameKey: "ehsqName", signKey: "ehsqSignature", designation: "EHSQ Officer" },
] as const;

export function AdminSignOff({ id, data }: { id: string; data: Record<string, unknown> }) {
  const router = useRouter();
  const [names, setNames] = useState({
    fmName: String(data.fmName || ""),
    securityName: String(data.securityName || ""),
    ehsqName: String(data.ehsqName || ""),
  });
  const [signs, setSigns] = useState({
    fmSignature: String(data.fmSignature || ""),
    securitySignature: String(data.securitySignature || ""),
    ehsqSignature: String(data.ehsqSignature || ""),
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const result = await saveAdminSignatures(id, { ...names, ...signs });
    setSaving(false);
    notify(result.ok ? "Signatures saved on the permit" : result.error || "Could not save the signatures", result.ok ? "ok" : "error");
    if (result.ok) router.refresh();
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h3 className="font-semibold text-foreground">Section V — SMA signatures</h3>
      <p className="mb-3 text-sm text-muted-foreground">The contractor signature stays as submitted. These three are completed here by SMA.</p>
      <div className="grid gap-4 lg:grid-cols-3">
        {ROLES.map((role) => (
          <div key={role.nameKey} className="rounded-xl border border-border p-3">
            <p className="text-sm font-semibold">{role.designation}</p>
            <Label className="mt-2">Name</Label>
            <Input className="mt-1" value={names[role.nameKey]} onChange={(event) => setNames({ ...names, [role.nameKey]: event.target.value })} />
            <p className="mt-2 text-xs text-muted-foreground">Designation: {role.designation}</p>
            <SignaturePadField onChange={(url) => setSigns({ ...signs, [role.signKey]: url || "" })} />
            {signs[role.signKey] && <img src={signs[role.signKey]} alt="" className="mt-2 h-12 bg-[#13294B] object-contain" />}
          </div>
        ))}
      </div>
      <Button type="button" className="mt-4" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save SMA signatures"}</Button>
    </section>
  );
}
