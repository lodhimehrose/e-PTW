"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { issueGatePass, updateSubmissionFields } from "@/app/actions/admin";

export function EditSubmissionForm({
  id,
  companyName,
  contactEmail,
  building,
  fields,
}: {
  id: string;
  companyName: string;
  contactEmail: string;
  building: string;
  fields: { key: string; label: string; value: string }[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setMessage("");
    const data: Record<string, string> = {};
    for (const field of fields) {
      data[field.key] = String(formData.get(field.key) ?? "");
    }
    const result = await updateSubmissionFields(id, {
      companyName: String(formData.get("companyName") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
      building: String(formData.get("building") ?? ""),
      data,
    });
    setSaving(false);
    setMessage(result.ok ? "Details saved." : result.error ?? "Could not save.");
    if (result.ok) router.refresh();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit(new FormData(e.currentTarget));
      }}
      className="space-y-3 rounded-2xl border border-border bg-card p-4"
    >
      <h3 className="font-semibold text-foreground">Correct form details</h3>
      <div>
        <Label htmlFor="companyName">Company</Label>
        <Input id="companyName" name="companyName" defaultValue={companyName} />
      </div>
      <div>
        <Label htmlFor="contactEmail">Contact email</Label>
        <Input id="contactEmail" name="contactEmail" type="email" defaultValue={contactEmail} />
      </div>
      <div>
        <Label htmlFor="building">Location</Label>
        <Input id="building" name="building" defaultValue={building} />
      </div>
      {fields.map((field) => (
        <div key={field.key}>
          <Label htmlFor={field.key}>{field.label}</Label>
          {field.value.length > 80 ? (
            <Textarea id={field.key} name={field.key} defaultValue={field.value} />
          ) : (
            <Input id={field.key} name={field.key} defaultValue={field.value} />
          )}
        </div>
      ))}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save corrections"}
      </Button>
      {message && <p className="text-sm text-foreground">{message}</p>}
    </form>
  );
}

export function IssueGatePassForm({
  permitId,
  companyName,
  contactEmail,
  building,
}: {
  permitId: string;
  companyName: string;
  contactEmail: string;
  building: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setMessage("");
    const result = await issueGatePass(permitId, {
      companyName: String(formData.get("companyName") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
      building: String(formData.get("building") ?? ""),
      purpose: String(formData.get("purpose") ?? ""),
      entryFrom: String(formData.get("entryFrom") ?? ""),
      entryTo: String(formData.get("entryTo") ?? ""),
    });
    setSaving(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    router.push(`/admin/submissions/${result.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit(new FormData(e.currentTarget));
      }}
      className="space-y-3 rounded-2xl border border-border bg-card p-4"
    >
      <h3 className="font-semibold text-foreground">Issue a gate pass</h3>
      <p className="text-sm text-muted-foreground">
        Creates an approved gate pass linked to this permit and assigns it to the same contractor.
      </p>
      <div>
        <Label htmlFor="gp-company">Company</Label>
        <Input id="gp-company" name="companyName" defaultValue={companyName} required />
      </div>
      <div>
        <Label htmlFor="gp-email">Contact email</Label>
        <Input id="gp-email" name="contactEmail" type="email" defaultValue={contactEmail} required />
      </div>
      <div>
        <Label htmlFor="gp-building">Location</Label>
        <Input id="gp-building" name="building" defaultValue={building} />
      </div>
      <div>
        <Label htmlFor="purpose">Purpose</Label>
        <Textarea id="purpose" name="purpose" required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="entryFrom">Entry from</Label>
          <Input id="entryFrom" name="entryFrom" type="date" required />
        </div>
        <div>
          <Label htmlFor="entryTo">Entry to</Label>
          <Input id="entryTo" name="entryTo" type="date" required />
        </div>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Issuing…" : "Issue gate pass"}
      </Button>
      {message && <p className="text-sm text-foreground">{message}</p>}
    </form>
  );
}
