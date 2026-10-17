"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormWizard } from "@/components/form-wizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/field-error";
import { SignaturePadField } from "@/components/signature-pad";
import { FileUploadField } from "@/components/file-upload-field";
import { useFormDraft } from "@/hooks/use-form-draft";
import { submitForm } from "@/app/actions/submissions";
import type { FilePayload } from "@/app/actions/submissions";
import { HSE_SECTIONS } from "@/lib/hse-requirements";
import { addWorkingDays, dubaiToday } from "@/lib/working-days";
import { format } from "date-fns";

type Draft = {
  companyName: string;
  applicantEmail: string;
  applicantName: string;
  department: string;
  workDescription: string;
  startDate: string;
  endDate: string;
  building: string;
  floorArea: string;
  ppe: string[];
  maxWorkers: string;
  hseAck: Record<string, boolean>;
  undertakings: boolean[];
  declarantName: string;
  signatureDataUrl?: string;
  documents: FilePayload[];
  honeypot: string;
};

const initial: Draft = {
  companyName: "",
  applicantEmail: "",
  applicantName: "",
  department: "",
  workDescription: "",
  startDate: "",
  endDate: "",
  building: "Building 1",
  floorArea: "",
  ppe: [],
  maxWorkers: "1",
  hseAck: {},
  undertakings: [false, false, false, false],
  declarantName: "",
  documents: [],
  honeypot: "",
};

export function PtwStandardForm() {
  const router = useRouter();
  const { data, setData, clearDraft, hydrated } = useFormDraft("draft-ptw-standard", initial);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(s: number) {
    const e: Record<string, string> = {};
    if (s === 1 && (!data.companyName || !data.applicantEmail)) e.companyName = "Required";
    if (s === 2 && data.workDescription.length < 30) e.workDescription = "Min 30 chars";
    if (s === 3) {
      if (!data.startDate || !data.endDate) e.endDate = "Required";
      const min = addWorkingDays(dubaiToday(), 3, [6, 0], []);
      if (data.startDate && new Date(data.startDate) < min) e.startDate = "notice";
    }
    if (s === 4 && data.ppe.length === 0) e.ppe = "Select PPE";
    if (s === 4 && data.documents.length === 0) e.documents = "Attach the method statement, trade license, or IDs";
    if (s === 5) {
      if (!data.hseAck.A) e.hse = "Acknowledge HSE";
      if (!data.undertakings.every(Boolean)) e.undertakings = "All undertakings";
      if (!data.declarantName || !data.signatureDataUrl) e.declarantName = "Name and signature required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate(5)) return;
    setSubmitting(true);
    const res = await submitForm({
      type: "ptw_standard",
      honeypot: data.honeypot,
      companyName: data.companyName,
      contactEmail: data.applicantEmail,
      building: data.building,
      startAt: data.startDate,
      endAt: data.endDate,
      maxWorkers: parseInt(data.maxWorkers, 10),
      signatureDataUrl: data.signatureDataUrl,
      documents: data.documents,
      data: { ...data, submittedAt: new Date().toISOString() },
    });
    setSubmitting(false);
    if (!res.ok) { setErrors({ submit: res.error }); return; }
    clearDraft();
    router.push(`/submitted/${encodeURIComponent(res.refNo)}?type=ptw_standard`);
  }

  if (!hydrated) return null;

  return (
    <FormWizard step={step} totalSteps={5} stepTitle={["Applicant", "Work", "Dates", "PPE & docs", "Sign"] [step - 1]} onBack={() => setStep((s) => s - 1)} onNext={() => validate(step) && setStep((s) => s + 1)} isLast={step === 5} onSubmit={handleSubmit} submitting={submitting}>
      {step === 1 && (
        <div className="grid gap-3">
          <Input value={data.companyName} onChange={(e) => setData({ ...data, companyName: e.target.value })} placeholder="Company *" />
          <Input value={data.applicantName} onChange={(e) => setData({ ...data, applicantName: e.target.value })} placeholder="Applicant name *" />
          <Input type="email" value={data.applicantEmail} onChange={(e) => setData({ ...data, applicantEmail: e.target.value })} placeholder="Email *" />
          <Input value={data.department} onChange={(e) => setData({ ...data, department: e.target.value })} placeholder="SMA department *" />
        </div>
      )}
      {step === 2 && <Textarea value={data.workDescription} onChange={(e) => setData({ ...data, workDescription: e.target.value })} placeholder="Scope (min 30 characters) *" />}
      {step === 3 && (
        <>
          <Input type="date" value={data.startDate} onChange={(e) => setData({ ...data, startDate: e.target.value })} />
          {errors.startDate === "notice" && <p className="text-sm text-red-600">Need 3 working days — use <Link href="/ptw/emergency" className="underline">Emergency PTW</Link></p>}
          <Input type="date" value={data.endDate} onChange={(e) => setData({ ...data, endDate: e.target.value })} />
          <Input value={data.floorArea} onChange={(e) => setData({ ...data, floorArea: e.target.value })} placeholder="Floor / area *" />
        </>
      )}
      {step === 4 && (
        <>
          {["Fire extinguishers", "Helmet & shoes", "Safety vest"].map((p) => (
            <label key={p} className="flex gap-2 text-sm"><Checkbox checked={data.ppe.includes(p)} onCheckedChange={(c) => setData({ ...data, ppe: c ? [...data.ppe, p] : data.ppe.filter((x) => x !== p) })} />{p}</label>
          ))}
          <FileUploadField
            label="Method statement, trade license, and IDs"
            files={data.documents}
            onChange={(f) => setData({ ...data, documents: f })}
            multiple
            required
          />
          <FieldError message={errors.documents} />
        </>
      )}
      {step === 5 && (
        <>
          <div className="rounded border p-3 text-xs">{HSE_SECTIONS[0].title}: <Checkbox checked={!!data.hseAck.A} onCheckedChange={(c) => setData({ ...data, hseAck: { A: c === true } })} /> I comply</div>
          {data.undertakings.map((_, i) => (
            <label key={i} className="flex gap-2 text-sm"><Checkbox checked={data.undertakings[i]} onCheckedChange={(c) => { const u = [...data.undertakings]; u[i] = c === true; setData({ ...data, undertakings: u }); }} />Undertaking {i + 1}</label>
          ))}
          <Input value={data.declarantName} onChange={(e) => setData({ ...data, declarantName: e.target.value })} />
          <SignaturePadField onChange={(u) => setData({ ...data, signatureDataUrl: u })} />
          <p className="text-sm text-muted-foreground">{format(new Date(), "dd MMM yyyy")}</p>
          <FieldError message={errors.submit} />
        </>
      )}
    </FormWizard>
  );
}
