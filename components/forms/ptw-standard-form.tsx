"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/field-error";
import { SignaturePadField } from "@/components/signature-pad";
import { FileUploadField } from "@/components/file-upload-field";
import { submitForm, type FilePayload } from "@/app/actions/submissions";
import { loadRoster, type SavedWorker } from "@/app/actions/roster";
import { loadAccountProfile } from "@/app/actions/account";
import { CompanyPicker } from "@/components/company-picker";
import type { CompanyMatch } from "@/app/actions/roster";
import { WorkersEditor } from "@/components/workers-editor";
import { workerFieldError, validateEidAfterWorkEnd, validateWorkersEidUnique, type WorkerInput } from "@/lib/validations/worker";
import { SECTION_IV_UNDERTAKINGS } from "@/lib/constants";
import { CRITICAL_ACTIVITY, NORMAL_ACTIVITY, toggleItem, WorkScopePanel } from "@/components/forms/work-scope-panel";
import { addWorkingDays, dubaiToday } from "@/lib/working-days";
import { notify } from "@/components/notice-bar";
import { HSE_SECTIONS } from "@/lib/hse-requirements";

const PPE = [
  "Fire extinguishers",
  "Safety helmet & safety shoes",
  "Safety vest",
  "Full body harness (double lanyard)",
  "Gas detector",
  "Ear plugs / mask / gloves",
  "Warning signs / safety barriers",
  "Others",
];

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
  undertakings: boolean[];
  declarantName: string;
  signatureDataUrl?: string;
  documents: FilePayload[];
  workers: WorkerInput[];
  tradeLicenseNo: string;
  tradeLicenseExpiry: string;
  tradeLicenseFiles: FilePayload[];
  storedLicenseNames: string[];
  storedLicensePaths: string[];
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
  undertakings: [false, false, false, false],
  declarantName: "",
  documents: [],
  workers: [{ fullName: "", trade: "", emiratesId: "", eidExpiry: "", mobile: "", inductionDone: "no" }],
  tradeLicenseNo: "",
  tradeLicenseExpiry: "",
  tradeLicenseFiles: [],
  storedLicenseNames: [],
  storedLicensePaths: [],
  declarantDesignation: "",
  designation: "",
  applicantPhone: "",
  supervisorName: "",
  supervisorPhone: "",
  honeypot: "",
};

function Mark({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <div className={ok ? "[&_label]:text-green-300" : "[&_label]:text-red-300"}>{children}</div>;
}

export function PtwStandardForm() {
  const router = useRouter();
  const [data, setData] = useState<Draft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [savedWorkers, setSavedWorkers] = useState<SavedWorker[]>([]);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    Promise.all([loadAccountProfile(), loadRoster()]).then(([profile, roster]) => {
      setSavedWorkers(roster.workers);
      setData((current) => ({
        ...current,
        companyName: profile?.companyName || roster.company?.companyName || current.companyName,
        applicantEmail: profile?.email || roster.company?.contactEmail || current.applicantEmail,
        applicantName: roster.company?.applicantName || current.applicantName,
        tradeLicenseNo: profile?.tradeLicenseNo || roster.company?.tradeLicenseNo || current.tradeLicenseNo,
        tradeLicenseExpiry: profile?.tradeLicenseExpiry || current.tradeLicenseExpiry,
        storedLicenseNames: profile?.tradeLicenseNames ?? [],
        storedLicensePaths: profile?.tradeLicensePaths ?? [],
        department: roster.company?.department || current.department,
        supervisorName: roster.company?.supervisorName || current.supervisorName,
        building: roster.company?.building || current.building,
      }));
    });
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const attending = data.workers.filter((worker) => worker.fullName.trim() || worker.emiratesId.trim());
  const licenseReady = data.tradeLicenseFiles.length > 0 || data.storedLicensePaths.length > 0;
  const companyOk = Boolean(data.companyName.trim() && data.tradeLicenseNo.trim() && data.tradeLicenseExpiry && licenseReady && data.applicantEmail.includes("@") && data.applicantName.trim() && data.department.trim());
  const scopeOk = data.workDescription.trim().length >= 30 && Boolean(data.startDate && data.endDate && data.timeFrom && data.timeTo && data.floorArea.trim());
  const peopleOk = data.ppe.length > 0 && data.documents.length > 0 && attending.length > 0;
  const signOk = data.undertakings.every(Boolean) && Boolean(data.declarantName && data.declarantDesignation && data.signatureDataUrl);
  const minStart = addWorkingDays(dubaiToday(), 3, [6, 0], []);

  function validate() {
    const e: Record<string, string> = {};
    if (!data.companyName.trim() || !data.applicantEmail.includes("@")) e.companyName = "Company and email are required.";
    if (!data.tradeLicenseNo.trim()) e.tradeLicenseNo = "Trade license number is required.";
    if (!data.tradeLicenseExpiry) e.tradeLicenseExpiry = "Trade license expiry is required.";
    else if (data.tradeLicenseExpiry < today) e.tradeLicenseExpiry = "Trade license is expired. Update it before this company can apply.";
    if (!licenseReady) e.tradeLicenseFile = "Upload the trade license.";
    if (!data.applicantName.trim()) e.applicantName = "Applicant name is required.";
    if (!data.department.trim()) e.department = "SMA requesting department is required.";
    if (data.workDescription.trim().length < 30) e.workDescription = "Describe the scope in at least 30 characters.";
    if (!data.startDate || !data.endDate || !data.timeFrom || !data.timeTo) e.time = "Enter the date and time from and to.";
    if (data.startDate && new Date(data.startDate) < minStart) e.startDate = "Standard permits need 3 working days. Use the emergency form for work that cannot wait.";
    if (!data.floorArea.trim()) e.floorArea = "Enter the floor or area.";
    if (!data.ppe.length) e.ppe = "Select the PPE for this job.";
    if (!data.documents.length) e.documents = "Attach the method statement or certificates.";
    if (!attending.length) e.workers = "Add at least one worker.";
    attending.forEach((worker) => {
      const index = data.workers.indexOf(worker);
      const message = workerFieldError(worker);
      if (message) e[`workers.${index}`] = message;
    });
    if (!validateWorkersEidUnique(attending)) e.workers = "Duplicate Emirates ID.";
    if (data.endDate && attending.length && !validateEidAfterWorkEnd(attending, data.endDate)) {
      e.workers = "A worker's Emirates ID expires before the job ends. Provide an updated ID.";
    }
    if (!data.undertakings.every(Boolean)) e.undertakings = "Confirm each statement.";
    if (!data.declarantName) e.declarantName = "Name is required.";
    if (!data.declarantDesignation) e.declarantDesignation = "Designation is required.";
    if (!data.signatureDataUrl) e.signature = "Draw or upload a signature.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      notify("Complete the fields still marked in red.", "error");
      return;
    }
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
        ...data.tradeLicenseFiles.map((file) => ({ ...file, name: `Trade-license-${file.name}` })),
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
        storedTradeLicensePaths: data.storedLicensePaths,
        storedEidCopies: attending
          .filter((worker) => worker.storedEidPath && !worker.eidCopy)
          .map((worker) => ({ path: worker.storedEidPath, name: worker.storedEidName || `EID-${worker.fullName}` })),
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
    if (!res.ok) {
      setErrors({ submit: res.error });
      notify(res.error, "error");
      return;
    }
    notify(res.emailWarning || "Standard permit submitted. EHS has been emailed.");
    router.push(`/submitted/${encodeURIComponent(res.refNo)}?type=ptw_standard`);
  }

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
        storedEidPath: worker.eidFilePath,
        storedEidName: worker.eidFileName,
      })),
    });
  }

  return (
    <form
      className="space-y-5 rounded-3xl bg-card/70 p-4 shadow-sm ring-1 ring-white/10 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">Fill the form</h2>
        <p className="mt-1 text-sm text-muted-foreground">Fields you must complete start in red and turn green when they are filled. Grey sections are for the EHS officer.</p>
      </div>

      <section className="space-y-3 rounded-2xl bg-white/5 p-4">
        <h3 className="text-lg font-semibold">Applicant</h3>
        <CompanyPicker query={data.companyName} onSelect={applyCompany} />
        <Mark ok={Boolean(data.companyName.trim())}>
          <Label>Company name *</Label>
          <Input className="mt-1" value={data.companyName} onChange={(event) => setData({ ...data, companyName: event.target.value })} />
        </Mark>
        <div className="grid gap-3 sm:grid-cols-2">
          <Mark ok={Boolean(data.tradeLicenseNo.trim())}>
            <Label>Trade license no. *</Label>
            <Input className="mt-1" value={data.tradeLicenseNo} onChange={(event) => setData({ ...data, tradeLicenseNo: event.target.value })} />
          </Mark>
          <Mark ok={Boolean(data.tradeLicenseExpiry)}>
            <Label>Trade license expiry *</Label>
            <Input className="mt-1" type="date" value={data.tradeLicenseExpiry} onChange={(event) => setData({ ...data, tradeLicenseExpiry: event.target.value })} />
          </Mark>
        </div>
        <Mark ok={licenseReady}>
          {data.storedLicenseNames.length > 0 && (
            <p className="mb-2 text-sm text-green-300">Already on the account: {data.storedLicenseNames.join(", ")}</p>
          )}
          <FileUploadField
            label="Trade license"
            files={data.tradeLicenseFiles}
            onChange={(files) => setData({ ...data, tradeLicenseFiles: files })}
            multiple
            required={!data.storedLicensePaths.length}
          />
        </Mark>
        <div className="grid gap-3 sm:grid-cols-2">
          <Mark ok={Boolean(data.applicantName.trim())}>
            <Label>Applicant name *</Label>
            <Input className="mt-1" value={data.applicantName} onChange={(event) => setData({ ...data, applicantName: event.target.value })} />
          </Mark>
          <div>
            <Label>Designation</Label>
            <Input className="mt-1" value={data.designation} onChange={(event) => setData({ ...data, designation: event.target.value })} />
          </div>
          <Mark ok={data.applicantEmail.includes("@")}>
            <Label>Email *</Label>
            <Input className="mt-1" type="email" value={data.applicantEmail} onChange={(event) => setData({ ...data, applicantEmail: event.target.value })} />
          </Mark>
          <div>
            <Label>Applicant contact no.</Label>
            <Input className="mt-1" value={data.applicantPhone} onChange={(event) => setData({ ...data, applicantPhone: event.target.value })} />
          </div>
          <div>
            <Label>Site supervisor</Label>
            <Input className="mt-1" value={data.supervisorName} onChange={(event) => setData({ ...data, supervisorName: event.target.value })} />
          </div>
          <div>
            <Label>Site contact no.</Label>
            <Input className="mt-1" value={data.supervisorPhone} onChange={(event) => setData({ ...data, supervisorPhone: event.target.value })} />
          </div>
          <Mark ok={Boolean(data.department.trim())}>
            <Label>SMA requesting department *</Label>
            <Input className="mt-1" value={data.department} onChange={(event) => setData({ ...data, department: event.target.value })} />
          </Mark>
          <div>
            <Label>Building</Label>
            <Input className="mt-1" value={data.building} onChange={(event) => setData({ ...data, building: event.target.value })} />
          </div>
        </div>
        <FieldError message={errors.companyName || errors.tradeLicenseNo || errors.tradeLicenseExpiry || errors.tradeLicenseFile || errors.applicantName || errors.department} />
      </section>

      <section className="space-y-3 rounded-2xl bg-white/5 p-4">
        <Mark ok={scopeOk}><h3 className="text-lg font-semibold">Scope and timing *</h3></Mark>
        <WorkScopePanel
          scope={data.workDescription}
          onScope={(workDescription) => setData({ ...data, workDescription })}
          activities={data.workType}
          lightWorks={data.lightWorks}
          criticalWorks={data.criticalWorks}
          onToggleActivity={(item) => setData({
            ...data,
            workType: toggleItem(data.workType, item),
            lightWorks: item === NORMAL_ACTIVITY && data.workType.includes(NORMAL_ACTIVITY) ? [] : data.lightWorks,
            criticalWorks: item === CRITICAL_ACTIVITY && data.workType.includes(CRITICAL_ACTIVITY) ? [] : data.criticalWorks,
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
          lockClassification
          notice={errors.startDate ? (
            <p className="mt-2 text-sm text-red-300">
              {errors.startDate} <Link href="/ptw/emergency" className="underline">Open the emergency form</Link>
            </p>
          ) : null}
        />
        <Mark ok={Boolean(data.floorArea.trim())}>
          <Label>Floor / area *</Label>
          <Input className="mt-1" value={data.floorArea} onChange={(event) => setData({ ...data, floorArea: event.target.value })} placeholder="Building, floor, and area" />
        </Mark>
        <FieldError message={errors.floorArea || errors.startDate} />
      </section>

      <section className="space-y-3 rounded-2xl bg-white/5 p-4">
        <Mark ok={peopleOk}><h3 className="text-lg font-semibold">PPE, documents, and workers *</h3></Mark>
        {PPE.map((item) => (
          <label key={item} className="flex gap-2 text-sm">
            <Checkbox
              checked={data.ppe.includes(item)}
              onCheckedChange={(checked) => setData({ ...data, ppe: checked ? [...data.ppe, item] : data.ppe.filter((entry) => entry !== item) })}
            />
            {item}
          </label>
        ))}
        <FileUploadField
          label="Method statement and certificates"
          files={data.documents}
          onChange={(files) => setData({ ...data, documents: files })}
          multiple
          required
        />
        <WorkersEditor workers={data.workers} savedWorkers={savedWorkers} onChange={(workers) => setData({ ...data, workers })} errors={errors} />
        <FieldError message={errors.ppe || errors.documents || errors.workers} />
      </section>

      <section className="space-y-3 rounded-2xl bg-white/5 p-4">
        <Mark ok={signOk}><h3 className="text-lg font-semibold">Undertaking and signature *</h3></Mark>
        {SECTION_IV_UNDERTAKINGS.map((text, index) => (
          <label key={text} className="flex gap-2 text-sm">
            <Checkbox
              checked={data.undertakings[index]}
              onCheckedChange={(checked) => {
                const undertakings = [...data.undertakings];
                undertakings[index] = checked === true;
                setData({ ...data, undertakings });
              }}
            />
            {index + 1}. {text}
          </label>
        ))}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Name *</Label>
            <Input value={data.declarantName} onChange={(event) => setData({ ...data, declarantName: event.target.value })} />
          </div>
          <div>
            <Label>Designation *</Label>
            <Input value={data.declarantDesignation} onChange={(event) => setData({ ...data, declarantDesignation: event.target.value })} />
          </div>
        </div>
        <SignaturePadField onChange={(url) => setData({ ...data, signatureDataUrl: url })} error={errors.signature} />
        <p className="text-sm text-muted-foreground">Date: {format(new Date(), "dd MMM yyyy")}</p>
        <FieldError message={errors.undertakings || errors.declarantName || errors.declarantDesignation} />
      </section>

      <section className="pointer-events-none space-y-2 rounded-2xl border border-dashed border-white/20 bg-black/20 p-4 opacity-70">
        <h3 className="font-semibold text-foreground">HSE requirements and SMA approval</h3>
        <p className="text-xs text-muted-foreground">Completed by the EHS officer after this form is submitted. Contractors cannot change this section.</p>
        {HSE_SECTIONS.map((section) => (
          <p key={section.id} className="text-sm text-muted-foreground">{section.title}</p>
        ))}
      </section>

      <input className="hidden" tabIndex={-1} autoComplete="off" value={data.honeypot} onChange={(event) => setData({ ...data, honeypot: event.target.value })} />
      <FieldError message={errors.submit} />
      <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Submitting…" : "Submit"}</Button>
      {!companyOk || !scopeOk || !peopleOk || !signOk ? (
        <p className="text-center text-xs text-red-300">Complete every red field before submitting.</p>
      ) : (
        <p className="text-center text-xs text-green-300">Required details are complete. You can submit.</p>
      )}
    </form>
  );
}
