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
import { useFormDraft } from "@/hooks/use-form-draft";
import { FileUploadField } from "@/components/file-upload-field";
import { submitForm, type FilePayload } from "@/app/actions/submissions";
import { formatEmiratesId, workerFieldError, validateEidAfterWorkEnd, type WorkerInput } from "@/lib/validations/worker";
import { loadRoster } from "@/app/actions/roster";
import { CompanyPicker } from "@/components/company-picker";
import type { CompanyMatch } from "@/app/actions/roster";
import { format } from "date-fns";
import { SECTION_IV_UNDERTAKINGS } from "@/lib/constants";

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
  tradeLicenseExpiry: string;
  tradeLicenseFile?: FilePayload;
  declarantDesignation: string;
  contactEmail: string;
  maxWorkers: string;
  workers: WorkerInput[];
  workScope: string;
  validFrom: string;
  validUntil: string;
  safetyControls: string[];
  declaration: boolean;
  undertakings: boolean[];
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
  tradeLicenseExpiry: "",
  declarantDesignation: "",
  undertakings: [false, false, false, false],
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
  const rosterOnce = useRef(false);
  const supervisor = data.workers[0] ?? {
    fullName: "",
    trade: "Supervisor",
    emiratesId: "",
    eidExpiry: "",
    mobile: "",
    inductionDone: "yes" as const,
  };
  const workEnd = data.validUntil?.slice(0, 10);

  function setSupervisor(patch: Partial<WorkerInput>) {
    setData({ ...data, workers: [{ ...supervisor, ...patch }], maxWorkers: "1" });
  }

  useEffect(() => {
    if (!hydrated || rosterOnce.current) return;
    rosterOnce.current = true;
    loadRoster().then((roster) => {
      setData((current) => ({
        ...current,
        companyName: current.companyName || roster.company?.companyName || "",
        contactEmail: current.contactEmail || roster.company?.contactEmail || "",
        tradeLicenseNo: current.tradeLicenseNo || roster.company?.tradeLicenseNo || "",
        building: current.building || roster.company?.building || current.building,
        maxWorkers: "1",
      }));
    });
  }, [hydrated, setData]);

  function validate(s: number) {
    const e: Record<string, string> = {};
    const today = new Date().toISOString().slice(0, 10);
    if (s === 1 && (!data.reportedBy || !data.description || data.risks.length === 0)) e.description = "Complete step 1";
    if (s === 2) {
      if (!data.companyName || !data.contactEmail) e.companyName = "Company and email are required";
      if (!data.tradeLicenseNo) e.tradeLicenseNo = "Trade license number is required";
      if (!data.tradeLicenseExpiry) e.tradeLicenseExpiry = "Trade license expiry is required";
      else if (data.tradeLicenseExpiry < today) e.tradeLicenseExpiry = "Trade license is expired. Update the trade license before anyone from this company can apply.";
      if (!data.tradeLicenseFile) e.tradeLicenseFile = "Upload the trade license";
      const message = workerFieldError(supervisor);
      if (message) e["workers.0"] = message;
      if (supervisor.eidExpiry && supervisor.eidExpiry < today) {
        e["workers.0"] = "The supervisor's Emirates ID is expired. Provide an updated ID.";
      }
      if (workEnd && supervisor.eidExpiry && !validateEidAfterWorkEnd([supervisor], workEnd)) {
        e["workers.0"] = "The supervisor's Emirates ID expires before the job ends. Provide an updated ID.";
      }
    }
    if (s === 3 && (!data.workScope || !data.validUntil)) e.workScope = "Required";
    if (s === 4 && data.safetyControls.length !== SAFETY_CONTROLS.length) e.safety = "Confirm all 8";
    if (s === 5) {
      if (!data.undertakings.every(Boolean)) e.undertakings = "Confirm each statement in Section IV";
      if (!data.declarantName) e.declarantName = "Name is required";
      if (!data.declarantDesignation) e.declarantDesignation = "Designation is required";
      if (!data.signatureDataUrl) e.signature = "Draw or upload a signature";
    }
    const first = Object.values(e)[0];
    if (first) e.submit = first;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    for (const stepNumber of [1, 2, 3, 4, 5]) {
      if (!validate(stepNumber)) return;
    }
    const supervisor = data.workers[0];
    setSubmitting(true);
    const res = await submitForm({
      type: "ptw_emergency",
      honeypot: data.honeypot,
      companyName: data.companyName,
      contactEmail: data.contactEmail,
      building: data.building,
      startAt: data.validFrom,
      endAt: data.validUntil,
      maxWorkers: 1,
      signatureDataUrl: data.signatureDataUrl,
      documents: [
        ...data.documents,
        ...(data.tradeLicenseFile ? [{ ...data.tradeLicenseFile, name: `Trade-license-${data.tradeLicenseFile.name}` }] : []),
        ...(supervisor.eidCopy ? [{ ...supervisor.eidCopy, name: `EID-${supervisor.fullName}-${supervisor.eidCopy.name}` }] : []),
      ],
      data: {
        reportedAt: data.reportedAt,
        reportedBy: data.reportedBy,
        department: data.department,
        description: data.description,
        risks: data.risks,
        tradeLicenseNo: data.tradeLicenseNo,
        tradeLicenseExpiry: data.tradeLicenseExpiry,
        declarantName: data.declarantName,
        declarantDesignation: data.declarantDesignation,
        workScope: data.workScope,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        safetyControls: data.safetyControls,
        undertakings: SECTION_IV_UNDERTAKINGS.filter((_, index) => data.undertakings[index]),
        urgent: true,
        submittedAt: new Date().toISOString(),
      },
      workers: [{
        fullName: supervisor.fullName,
        trade: supervisor.trade || "Supervisor",
        emiratesId: supervisor.emiratesId,
        eidExpiry: supervisor.eidExpiry,
        mobile: supervisor.mobile,
        inductionDone: true,
      }],
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
          <Input value={data.tradeLicenseNo} onChange={(e) => setData({ ...data, tradeLicenseNo: e.target.value })} placeholder="Trade license no. *" />
          <FieldError message={errors.tradeLicenseNo} />
          <div>
            <Label>Trade license expiry *</Label>
            <Input type="date" value={data.tradeLicenseExpiry} onChange={(e) => setData({ ...data, tradeLicenseExpiry: e.target.value })} />
            <FieldError message={errors.tradeLicenseExpiry} />
          </div>
          <FileUploadField
            label="Trade license"
            files={data.tradeLicenseFile ? [data.tradeLicenseFile] : []}
            onChange={(files) => setData({ ...data, tradeLicenseFile: files[0] })}
            required
          />
          <FieldError message={errors.tradeLicenseFile} />
          <Input type="email" value={data.contactEmail} onChange={(e) => setData({ ...data, contactEmail: e.target.value })} placeholder="Email *" />
          <div className="rounded-md border border-border p-4">
            <p className="font-medium text-foreground">Supervisor</p>
            <p className="mt-1 text-xs text-muted-foreground">Emergency entry is for the supervisor only.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Full name *</Label>
                <Input value={supervisor.fullName} onChange={(e) => setSupervisor({ fullName: e.target.value })} />
              </div>
              <div>
                <Label>Designation *</Label>
                <Input value={supervisor.trade} onChange={(e) => setSupervisor({ trade: e.target.value })} />
              </div>
              <div>
                <Label>Emirates ID *</Label>
                <Input value={supervisor.emiratesId} placeholder="784-XXXX-XXXXXXX-X" onChange={(e) => setSupervisor({ emiratesId: formatEmiratesId(e.target.value) })} />
              </div>
              <div>
                <Label>EID expiry *</Label>
                <Input type="date" value={supervisor.eidExpiry} onChange={(e) => setSupervisor({ eidExpiry: e.target.value })} />
              </div>
              <div>
                <Label>Mobile *</Label>
                <Input inputMode="numeric" maxLength={10} placeholder="05XXXXXXXX" value={supervisor.mobile} onChange={(e) => setSupervisor({ mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
              </div>
              <div className="md:col-span-2">
                <FileUploadField label="Emirates ID copy" files={supervisor.eidCopy ? [supervisor.eidCopy] : []} onChange={(files) => setSupervisor({ eidCopy: files[0] })} />
              </div>
            </div>
            <FieldError message={errors["workers.0"]} />
          </div>
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
          <p className="text-sm font-semibold text-foreground">Section IV — Undertaking and affirmation</p>
          {SECTION_IV_UNDERTAKINGS.map((text, i) => (
            <label key={text} className="flex gap-2 text-sm">
              <Checkbox checked={!!data.undertakings[i]} onCheckedChange={(c) => { const u = [...data.undertakings]; u[i] = c === true; setData({ ...data, undertakings: u }); }} />
              {i + 1}. {text}
            </label>
          ))}
          <FieldError message={errors.undertakings} />
          <div>
            <Label>Name *</Label>
            <Input value={data.declarantName} onChange={(e) => setData({ ...data, declarantName: e.target.value })} />
            <FieldError message={errors.declarantName} />
          </div>
          <div>
            <Label>Designation *</Label>
            <Input value={data.declarantDesignation} onChange={(e) => setData({ ...data, declarantDesignation: e.target.value })} />
            <FieldError message={errors.declarantDesignation} />
          </div>
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
