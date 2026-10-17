"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormWizard } from "@/components/form-wizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/field-error";
import { SignaturePadField } from "@/components/signature-pad";
import { WorkersEditor } from "@/components/workers-editor";
import { useFormDraft } from "@/hooks/use-form-draft";
import { FileUploadField } from "@/components/file-upload-field";
import { submitForm, type FilePayload } from "@/app/actions/submissions";
import { workerFieldError, validateEidAfterWorkEnd, validateWorkersEidUnique, type WorkerInput } from "@/lib/validations/worker";
import { loadRoster, type SavedWorker } from "@/app/actions/roster";
import { CompanyPicker } from "@/components/company-picker";
import type { CompanyMatch } from "@/app/actions/roster";
import { format } from "date-fns";

const APPENDIX_B = `1. Emergency breakdowns only — cannot wait 3 working days.
2. Planned works need Standard PTW (Form-07).
3. H&S approval before work starts.
4. Max 12 hours validity.`;

const SAFETY_CONTROLS = [
  "Area barricaded and warning signs placed",
  "Occupants moved away from the affected area",
  "Energy sources isolated, locked and tagged (LOTO)",
  "Correct PPE worn by all workers",
  "Fire extinguisher available at the work point",
  "Fire watch arranged if fire systems are impaired",
  "Workers briefed on hazards (toolbox talk)",
  "SMA Security informed of workers and access route",
];

type Draft = {
  reportedAt: string;
  reportedBy: string;
  department: string;
  building: string;
  description: string;
  risks: string[];
  companyName: string;
  tradeLicenseNo: string;
  contactEmail: string;
  maxWorkers: string;
  workers: WorkerInput[];
  workScope: string;
  validFrom: string;
  validUntil: string;
  safetyControls: string[];
  declaration: boolean;
  declarantName: string;
  signatureDataUrl?: string;
  documents: FilePayload[];
  honeypot: string;
};

const initial: Draft = {
  reportedAt: new Date().toISOString().slice(0, 16),
  reportedBy: "",
  department: "",
  building: "Building 1",
  description: "",
  risks: [],
  companyName: "",
  tradeLicenseNo: "",
  contactEmail: "",
  maxWorkers: "5",
  workers: [{ fullName: "", trade: "", emiratesId: "", eidExpiry: "", mobile: "", inductionDone: "no" }],
  workScope: "",
  validFrom: new Date().toISOString().slice(0, 16),
  validUntil: "",
  safetyControls: [],
  declaration: false,
  declarantName: "",
  documents: [],
  honeypot: "",
};

const STEPS = ["Emergency", "Contractor", "Scope", "Safety", "Submit"];

export function PtwEmergencyForm() {
  const router = useRouter();
  const { data, setData, clearDraft, hydrated } = useFormDraft("draft-ptw-emergency", initial);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [savedWorkers, setSavedWorkers] = useState<SavedWorker[]>([]);
  const rosterOnce = useRef(false);
  const maxW = parseInt(data.maxWorkers, 10) || 30;
  const workEnd = data.validUntil?.slice(0, 10);

  useEffect(() => {
    if (!hydrated || rosterOnce.current) return;
    rosterOnce.current = true;
    loadRoster().then((roster) => {
      setSavedWorkers(roster.workers);
      if (!roster.company) return;
      setData((current) => ({
        ...current,
        companyName: current.companyName || roster.company?.companyName || "",
        contactEmail: current.contactEmail || roster.company?.contactEmail || "",
        tradeLicenseNo: current.tradeLicenseNo || roster.company?.tradeLicenseNo || "",
        building: current.building || roster.company?.building || current.building,
      }));
    });
  }, [hydrated, setData]);

  function validate(s: number) {
    const e: Record<string, string> = {};
    if (s === 1 && (!data.reportedBy || !data.description || data.risks.length === 0)) e.description = "Complete step 1";
    if (s === 2) {
      if (!data.companyName || !data.contactEmail) e.companyName = "Required";
      data.workers.forEach((worker, index) => {
        const message = workerFieldError(worker);
        if (message) e[`workers.${index}`] = message;
      });
      if (!validateWorkersEidUnique(data.workers)) e.workers = "Duplicate Emirates ID";
      if (workEnd && !validateEidAfterWorkEnd(data.workers, workEnd)) {
        e.workers = "A worker's Emirates ID expires before the job ends";
      }
    }
    if (s === 3 && (!data.workScope || !data.validUntil)) e.workScope = "Required";
    if (s === 4 && data.safetyControls.length !== SAFETY_CONTROLS.length) e.safety = "Confirm all 8";
    if (s === 5) {
      if (!data.declaration || !data.declarantName) e.declarantName = "Required";
      if (!data.signatureDataUrl) e.signature = "Signature required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate(5)) return;
    setSubmitting(true);
    const res = await submitForm({
      type: "ptw_emergency",
      honeypot: data.honeypot,
      companyName: data.companyName,
      contactEmail: data.contactEmail,
      building: data.building,
      startAt: data.validFrom,
      endAt: data.validUntil,
      maxWorkers: maxW,
      signatureDataUrl: data.signatureDataUrl,
      documents: [
        ...data.documents,
        ...data.workers.flatMap((worker) =>
          worker.eidCopy
            ? [{ ...worker.eidCopy, name: `EID-${worker.fullName}-${worker.eidCopy.name}` }]
            : [],
        ),
      ],
      data: {
        reportedBy: data.reportedBy,
        department: data.department,
        description: data.description,
        risks: data.risks,
        tradeLicenseNo: data.tradeLicenseNo,
        workScope: data.workScope,
        safetyControls: data.safetyControls,
        urgent: true,
        submittedAt: new Date().toISOString(),
      },
      workers: data.workers.map((w) => ({
        fullName: w.fullName,
        trade: w.trade,
        emiratesId: w.emiratesId,
        eidExpiry: w.eidExpiry,
        mobile: w.mobile,
        inductionDone: w.inductionDone === "yes",
      })),
    });
    setSubmitting(false);
    if (!res.ok) { setErrors({ submit: res.error }); return; }
    clearDraft();
    router.push(`/submitted/${encodeURIComponent(res.refNo)}`);
  }

  if (!hydrated) return null;

  function applyCompany(company: CompanyMatch) {
    setData({
      ...data,
      companyName: company.companyName,
      contactEmail: company.contactEmail || data.contactEmail,
      tradeLicenseNo: company.tradeLicenseNo || data.tradeLicenseNo,
      building: company.building || data.building,
      workers: company.workers.length
        ? company.workers.map((worker) => ({
            fullName: worker.fullName,
            trade: worker.trade,
            emiratesId: worker.emiratesId,
            eidExpiry: worker.eidExpiry,
            mobile: worker.mobile,
            inductionDone: "no" as const,
          }))
        : data.workers,
    });
  }

  return (
    <div className="space-y-4">
    <FormWizard step={step} totalSteps={5} stepTitle={STEPS[step - 1]} onBack={() => setStep((s) => s - 1)} onNext={() => validate(step) && setStep((s) => s + 1)} isLast={step === 5} onSubmit={handleSubmit} submitting={submitting}>
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-center font-bold text-red-600">URGENT</p>
          <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} placeholder="Emergency description *" />
          {["Safety of people", "Fire / life safety", "Critical SMA operations"].map((r) => (
            <label key={r} className="flex gap-2 text-sm"><Checkbox checked={data.risks.includes(r)} onCheckedChange={(c) => setData({ ...data, risks: c ? [...data.risks, r] : data.risks.filter((x) => x !== r) })} />{r}</label>
          ))}
          <Input value={data.reportedBy} onChange={(e) => setData({ ...data, reportedBy: e.target.value })} placeholder="Reported by *" />
        </div>
      )}
      {step === 2 && (
        <>
          <Input value={data.companyName} onChange={(e) => setData({ ...data, companyName: e.target.value })} placeholder="Company *" />
          <Input type="email" value={data.contactEmail} onChange={(e) => setData({ ...data, contactEmail: e.target.value })} placeholder="Email *" />
          <WorkersEditor
            workers={data.workers}
            savedWorkers={savedWorkers}
            onChange={(w) => setData({ ...data, workers: w })}
            errors={errors}
          />
        </>
      )}
      {step === 3 && (
        <>
          <Textarea value={data.workScope} onChange={(e) => setData({ ...data, workScope: e.target.value })} />
          <Input type="datetime-local" value={data.validFrom} onChange={(e) => setData({ ...data, validFrom: e.target.value })} />
          <Input type="datetime-local" value={data.validUntil} onChange={(e) => setData({ ...data, validUntil: e.target.value })} />
        </>
      )}
      {step === 4 && SAFETY_CONTROLS.map((c) => (
        <label key={c} className="flex gap-2 text-sm"><Checkbox checked={data.safetyControls.includes(c)} onCheckedChange={(ch) => setData({ ...data, safetyControls: ch ? [...data.safetyControls, c] : data.safetyControls.filter((x) => x !== c) })} />{c}</label>
      ))}
      {step === 5 && (
        <>
          <Checkbox checked={data.declaration} onCheckedChange={(c) => setData({ ...data, declaration: c === true })} />
          <Input value={data.declarantName} onChange={(e) => setData({ ...data, declarantName: e.target.value })} placeholder="Name *" />
          <SignaturePadField onChange={(u) => setData({ ...data, signatureDataUrl: u })} error={errors.signature} />
          <FileUploadField
            label="Supporting files"
            files={data.documents}
            onChange={(files) => setData({ ...data, documents: files })}
            multiple
          />
          <FieldError message={errors.submit} />
        </>
      )}
    </FormWizard>
    <CompanyPicker query={data.companyName} onSelect={applyCompany} />
    </div>
  );
}
