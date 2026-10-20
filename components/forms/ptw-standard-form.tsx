"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormWizard } from "@/components/form-wizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/field-error";
import { SignaturePadField } from "@/components/signature-pad";
import { FileUploadField } from "@/components/file-upload-field";
import { useFormDraft } from "@/hooks/use-form-draft";
import { submitForm } from "@/app/actions/submissions";
import type { FilePayload } from "@/app/actions/submissions";
import { loadRoster, type SavedWorker } from "@/app/actions/roster";
import { CompanyPicker } from "@/components/company-picker";
import type { CompanyMatch } from "@/app/actions/roster";
import { WorkersEditor } from "@/components/workers-editor";
import { workerFieldError, validateEidAfterWorkEnd, validateWorkersEidUnique, type WorkerInput } from "@/lib/validations/worker";
import { SECTION_IV_UNDERTAKINGS } from "@/lib/constants";
import { CRITICAL_ACTIVITY, NORMAL_ACTIVITY, toggleItem, WorkScopePanel } from "@/components/forms/work-scope-panel";
import { addWorkingDays, dubaiToday } from "@/lib/working-days";
import { format } from "date-fns";

type Draft = {
  companyName: string;
  applicantEmail: string;
  applicantName: string;
  department: string;
  workDescription: string;
  workType: string[];
  lightWorks: string[];
  criticalWorks: string[];
  startDate: string;
  endDate: string;
  timeFrom: string;
  timeTo: string;
  building: string;
  floorArea: string;
  ppe: string[];
  maxWorkers: string;
  hseAck: Record<string, boolean>;
  undertakings: boolean[];
  declarantName: string;
  signatureDataUrl?: string;
  documents: FilePayload[];
  workers: WorkerInput[];
  tradeLicenseNo: string;
  tradeLicenseExpiry: string;
  tradeLicenseFile?: FilePayload;
  declarantDesignation: string;
  designation: string;
  applicantPhone: string;
  supervisorName: string;
  supervisorPhone: string;
  honeypot: string;
};

const initial: Draft = {
  companyName: "",
  applicantEmail: "",
  applicantName: "",
  department: "",
  workDescription: "",
  workType: [],
  lightWorks: [],
  criticalWorks: [],
  startDate: "",
  endDate: "",
  timeFrom: "",
  timeTo: "",
  building: "Building 1",
  floorArea: "",
  ppe: [],
  maxWorkers: "1",
  hseAck: {},
  undertakings: [false, false, false, false],
  declarantName: "",
  documents: [],
  workers: [{ fullName: "", trade: "", emiratesId: "", eidExpiry: "", mobile: "", inductionDone: "no" }],
  tradeLicenseNo: "",
  tradeLicenseExpiry: "",
  declarantDesignation: "",
  designation: "",
  applicantPhone: "",
  supervisorName: "",
  supervisorPhone: "",
  honeypot: "",
};

export function PtwStandardForm() {
  const router = useRouter();
  const { data, setData, clearDraft, hydrated } = useFormDraft("draft-ptw-standard", initial);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [savedWorkers, setSavedWorkers] = useState<SavedWorker[]>([]);
  const rosterOnce = useRef(false);

  useEffect(() => {
    if (!hydrated || rosterOnce.current) return;
    rosterOnce.current = true;
    loadRoster().then((roster) => {
      setSavedWorkers(roster.workers);
      if (!roster.company) return;
      setData((current) => ({
        ...current,
        companyName: current.companyName || roster.company?.companyName || "",
        applicantEmail: current.applicantEmail || roster.company?.contactEmail || "",
        applicantName: current.applicantName || roster.company?.applicantName || "",
        tradeLicenseNo: current.tradeLicenseNo || roster.company?.tradeLicenseNo || "",
        department: current.department || roster.company?.department || "",
        supervisorName: current.supervisorName || roster.company?.supervisorName || "",
        building: current.building || roster.company?.building || current.building,
      }));
    });
  }, [hydrated, setData]);

  function validate(s: number) {
    const e: Record<string, string> = {};
    const today = new Date().toISOString().slice(0, 10);
    const attending = data.workers.filter((worker) => worker.fullName.trim() || worker.emiratesId.trim());
    if (s === 1) {
      if (!data.companyName || !data.applicantEmail) e.companyName = "Company and email are required";
      if (!data.tradeLicenseNo) e.tradeLicenseNo = "Trade license number is required";
      if (!data.tradeLicenseExpiry) e.tradeLicenseExpiry = "Trade license expiry is required";
      else if (data.tradeLicenseExpiry < today) e.tradeLicenseExpiry = "Trade license is expired. Update the trade license before anyone from this company can apply.";
      if (!data.tradeLicenseFile) e.tradeLicenseFile = "Upload the trade license";
    }
    if (s === 2) {
      if (data.workDescription.length < 30) e.workDescription = "Describe the scope in at least 30 characters";
      if (!data.workType?.length) e.workType = "Tick normal activity, critical work, or both";
      if (!data.startDate || !data.endDate || !data.timeFrom || !data.timeTo) e.time = "Enter the date and time from and to";
      const min = addWorkingDays(dubaiToday(), 3, [6, 0], []);
      if (data.startDate && new Date(data.startDate) < min) e.startDate = "notice";
    }
    if (s === 4 && data.ppe.length === 0) e.ppe = "Select PPE";
    if (s === 4 && data.documents.length === 0) e.documents = "Attach the method statement, trade license, or IDs";
    if (s === 4) {
      if (!attending.length) e.workers = "Tick at least one worker, or add a new worker";
      attending.forEach((worker) => {
        const index = data.workers.indexOf(worker);
        const message = workerFieldError(worker);
        if (message) e[`workers.${index}`] = message;
      });
      if (!validateWorkersEidUnique(attending)) e.workers = "Duplicate Emirates ID";
      if (data.endDate && !validateEidAfterWorkEnd(attending, data.endDate)) {
        e.workers = "A worker's Emirates ID expires before the job ends. Provide an updated ID.";
      }
    }
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
    const attending = data.workers.filter((worker) => worker.fullName.trim() || worker.emiratesId.trim());
    setSubmitting(true);
    const res = await submitForm({
      type: "ptw_standard",
      honeypot: data.honeypot,
      companyName: data.companyName,
      contactEmail: data.applicantEmail,
      building: data.building,
      startAt: data.timeFrom ? `${data.startDate}T${data.timeFrom}` : data.startDate,
      endAt: data.timeTo ? `${data.endDate}T${data.timeTo}` : data.endDate,
      maxWorkers: attending.length,
      signatureDataUrl: data.signatureDataUrl,
      documents: [
        ...data.documents,
        ...(data.tradeLicenseFile ? [{ ...data.tradeLicenseFile, name: `Trade-license-${data.tradeLicenseFile.name}` }] : []),
        ...attending.flatMap((worker) =>
          worker.eidCopy ? [{ ...worker.eidCopy, name: `EID-${worker.fullName}-${worker.eidCopy.name}` }] : [],
        ),
      ],
      data: {
        applicantName: data.applicantName,
        designation: data.designation,
        declarantName: data.declarantName,
        declarantDesignation: data.declarantDesignation,
        applicantPhone: data.applicantPhone,
        department: data.department,
        tradeLicenseNo: data.tradeLicenseNo,
        tradeLicenseExpiry: data.tradeLicenseExpiry,
        supervisorName: data.supervisorName,
        supervisorPhone: data.supervisorPhone,
        workDescription: data.workDescription,
        workType: data.workType,
        lightWorks: data.lightWorks,
        criticalWorks: data.criticalWorks,
        startDate: data.startDate,
        endDate: data.endDate,
        timeFrom: data.timeFrom,
        timeTo: data.timeTo,
        floorArea: data.floorArea,
        ppe: data.ppe,
        undertakings: SECTION_IV_UNDERTAKINGS.filter((_, index) => data.undertakings[index]),
        submittedAt: new Date().toISOString(),
      },
      workers: attending.map((worker) => ({
        fullName: worker.fullName,
        trade: worker.trade,
        emiratesId: worker.emiratesId,
        eidExpiry: worker.eidExpiry,
        mobile: worker.mobile,
        inductionDone: worker.inductionDone === "yes",
      })),
    });
    setSubmitting(false);
    if (!res.ok) { setErrors({ submit: res.error }); return; }
    clearDraft();
    router.push(`/submitted/${encodeURIComponent(res.refNo)}?type=ptw_standard`);
  }

  if (!hydrated) return null;

  function applyCompany(company: CompanyMatch) {
    setData({
      ...data,
      companyName: company.companyName,
      tradeLicenseNo: company.tradeLicenseNo || data.tradeLicenseNo,
      applicantEmail: company.contactEmail || data.applicantEmail,
      applicantName: company.applicantName || data.applicantName,
      department: company.department || data.department,
      supervisorName: company.supervisorName || data.supervisorName,
      building: company.building || data.building,
      workers: company.workers.filter((worker) => !worker.expired).map((worker) => ({
            fullName: worker.fullName,
            trade: worker.trade,
            emiratesId: worker.emiratesId,
            eidExpiry: worker.eidExpiry,
            mobile: worker.mobile.replace(/\D/g, "").slice(0, 10),
            inductionDone: "no" as const,
          })),
    });
  }

  return (
    <div className="space-y-4">
    <FormWizard step={step} totalSteps={5} stepTitle={["Applicant", "Scope", "Location", "PPE & docs", "Sign"][step - 1]} onBack={() => setStep((s) => s - 1)} onNext={() => validate(step) && setStep((s) => s + 1)} isLast={step === 5} onSubmit={handleSubmit} submitting={submitting}>
      {step === 1 && (
        <div className="grid gap-3">
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
          <Input value={data.applicantName} onChange={(e) => setData({ ...data, applicantName: e.target.value })} placeholder="Applicant name *" />
          <Input value={data.designation} onChange={(e) => setData({ ...data, designation: e.target.value })} placeholder="Designation" />
          <Input type="email" value={data.applicantEmail} onChange={(e) => setData({ ...data, applicantEmail: e.target.value })} placeholder="Email *" />
          <Input value={data.applicantPhone} onChange={(e) => setData({ ...data, applicantPhone: e.target.value })} placeholder="Applicant contact no." />
          <Input value={data.supervisorName} onChange={(e) => setData({ ...data, supervisorName: e.target.value })} placeholder="Site supervisor" />
          <Input value={data.supervisorPhone} onChange={(e) => setData({ ...data, supervisorPhone: e.target.value })} placeholder="Site contact no." />
          <Input value={data.department} onChange={(e) => setData({ ...data, department: e.target.value })} placeholder="SMA requesting department *" />
        </div>
      )}
      {step === 2 && (
        <WorkScopePanel
          scope={data.workDescription}
          onScope={(workDescription) => setData({ ...data, workDescription })}
          activities={data.workType ?? []}
          lightWorks={data.lightWorks ?? []}
          criticalWorks={data.criticalWorks ?? []}
          onToggleActivity={(item) => setData({
            ...data,
            workType: toggleItem(data.workType, item),
            lightWorks: item === NORMAL_ACTIVITY && data.workType?.includes(NORMAL_ACTIVITY) ? [] : data.lightWorks,
            criticalWorks: item === CRITICAL_ACTIVITY && data.workType?.includes(CRITICAL_ACTIVITY) ? [] : data.criticalWorks,
          })}
          onToggleLight={(item) => setData({ ...data, lightWorks: toggleItem(data.lightWorks, item) })}
          onToggleCritical={(item) => setData({ ...data, criticalWorks: toggleItem(data.criticalWorks, item) })}
          fromDate={data.startDate}
          fromTime={data.timeFrom}
          toDate={data.endDate}
          toTime={data.timeTo}
          onFromDate={(startDate) => setData({ ...data, startDate })}
          onFromTime={(timeFrom) => setData({ ...data, timeFrom })}
          onToDate={(endDate) => setData({ ...data, endDate })}
          onToTime={(timeTo) => setData({ ...data, timeTo })}
          scopeError={errors.workDescription}
          timeError={errors.time}
          activityError={errors.workType}
          notice={errors.startDate === "notice" ? <p className="mt-2 text-sm text-red-600">Need 3 working days — use <Link href="/ptw/emergency" className="underline">Emergency PTW</Link></p> : null}
        />
      )}
      {step === 3 && (
        <div>
          <Label>Floor / area *</Label>
          <Input className="mt-1" value={data.floorArea} onChange={(e) => setData({ ...data, floorArea: e.target.value })} placeholder="Building, floor, and area" />
        </div>
      )}
      {step === 4 && (
        <>
          {["Fire extinguishers", "Safety helmet & safety shoes", "Safety vest", "Full body harness (double lanyard)", "Gas detector", "Ear plugs / mask / gloves", "Warning signs / safety barriers", "Others"].map((p) => (
            <label key={p} className="flex gap-2 text-sm"><Checkbox checked={data.ppe.includes(p)} onCheckedChange={(c) => setData({ ...data, ppe: c ? [...data.ppe, p] : data.ppe.filter((x) => x !== p) })} />{p}</label>
          ))}
          <FileUploadField
            label="Method statement, trade license, and certificates"
            files={data.documents}
            onChange={(f) => setData({ ...data, documents: f })}
            multiple
            required
          />
          <FieldError message={errors.documents} />
          <WorkersEditor
            workers={data.workers}
            savedWorkers={savedWorkers}
            onChange={(workers) => setData({ ...data, workers })}
            errors={errors}
          />
        </>
      )}
      {step === 5 && (
        <>
          <p className="text-sm font-semibold text-foreground">Section IV — Undertaking and affirmation</p>
          {SECTION_IV_UNDERTAKINGS.map((text, i) => (
            <label key={text} className="flex gap-2 text-sm">
              <Checkbox checked={data.undertakings[i]} onCheckedChange={(c) => { const u = [...data.undertakings]; u[i] = c === true; setData({ ...data, undertakings: u }); }} />
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
          <SignaturePadField error={errors.signature} onChange={(u) => setData({ ...data, signatureDataUrl: u })} />
          <p className="text-sm text-muted-foreground">Date: {format(new Date(), "dd MMM yyyy")}</p>
          <FieldError message={errors.submit} />
        </>
      )}
    </FormWizard>
    <CompanyPicker query={data.companyName} onSelect={applyCompany} />
    </div>
  );
}
