"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/field-error";
import { SignaturePadField } from "@/components/signature-pad";
import { FileUploadField } from "@/components/file-upload-field";
import { submitForm, type FilePayload } from "@/app/actions/submissions";
import { loadAccountProfile } from "@/app/actions/account";
import { loadRoster, type SavedWorker } from "@/app/actions/roster";
import { formatEmiratesId, workerFieldError, validateEidAfterWorkEnd, type WorkerInput } from "@/lib/validations/worker";
import { SECTION_IV_UNDERTAKINGS } from "@/lib/constants";
import { EMERGENCY_RISKS, SAFETY_CONTROLS } from "@/lib/safety-controls";
import { notify } from "@/components/notice-bar";
import { PeopleOnFile } from "@/components/people-on-file";

type Draft = {
  risks: string[];
  riskOther: string;
  companyName: string;
  tradeLicenseNo: string;
  tradeLicenseExpiry: string;
  tradeLicenseFiles: FilePayload[];
  storedLicenseNames: string[];
  storedLicensePaths: string[];
  contactEmail: string;
  building: string;
  workers: WorkerInput[];
  validFrom: string;
  validUntil: string;
  undertakings: boolean[];
  declarantName: string;
  declarantDesignation: string;
  signatureDataUrl?: string;
  honeypot: string;
};

const initial: Draft = {
  risks: [],
  riskOther: "",
  companyName: "",
  tradeLicenseNo: "",
  tradeLicenseExpiry: "",
  tradeLicenseFiles: [],
  storedLicenseNames: [],
  storedLicensePaths: [],
  contactEmail: "",
  building: "Building 1",
  workers: [{ fullName: "", trade: "Supervisor", emiratesId: "", eidExpiry: "", mobile: "", inductionDone: "yes" }],
  validFrom: "",
  validUntil: "",
  undertakings: [false, false, false, false],
  declarantName: "",
  declarantDesignation: "",
  honeypot: "",
};

function joinDateTime(date: string, time: string) {
  if (!date) return "";
  return time ? `${date}T${time}` : date;
}

function Mark({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <div className={ok ? "text-green-300" : "text-red-300"}>{children}</div>;
}

export function PtwEmergencyForm() {
  const router = useRouter();
  const [data, setData] = useState<Draft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [savedPeople, setSavedPeople] = useState<SavedWorker[]>([]);
  const once = useRef(false);
  const supervisor = data.workers[0];

  function setSupervisor(patch: Partial<WorkerInput>) {
    setData((current) => ({ ...current, workers: [{ ...current.workers[0], ...patch }] }));
  }

  useEffect(() => {
    if (once.current) return;
    once.current = true;
    Promise.all([loadAccountProfile(), loadRoster()]).then(([profile, roster]) => {
      setSavedPeople(roster.workers);
      if (!profile && !roster.company) return;
      setData((current) => ({
        ...current,
        companyName: profile?.companyName || roster.company?.companyName || current.companyName,
        tradeLicenseNo: profile?.tradeLicenseNo || roster.company?.tradeLicenseNo || current.tradeLicenseNo,
        tradeLicenseExpiry: profile?.tradeLicenseExpiry || current.tradeLicenseExpiry,
        contactEmail: profile?.email || roster.company?.contactEmail || current.contactEmail,
        storedLicenseNames: profile?.tradeLicenseNames ?? [],
        storedLicensePaths: profile?.tradeLicensePaths ?? [],
      }));
    });
  }, []);

  const fromDate = data.validFrom.slice(0, 10);
  const fromTime = data.validFrom.slice(11, 16);
  const toDate = data.validUntil.slice(0, 10);
  const toTime = data.validUntil.slice(11, 16);
  const licenseReady = data.tradeLicenseFiles.length > 0 || data.storedLicensePaths.length > 0;
  const companyOk = Boolean(data.companyName.trim() && data.tradeLicenseNo.trim() && data.tradeLicenseExpiry && licenseReady && data.contactEmail.includes("@"));
  const risksOk = data.risks.length > 0 && (!data.risks.includes("Others") || data.riskOther.trim().length > 1);
  const supervisorOk = !workerFieldError(supervisor);
  const timeOk = Boolean(fromDate && fromTime && toDate && toTime);
  const signOk = data.undertakings.every(Boolean) && Boolean(data.declarantName && data.declarantDesignation && data.signatureDataUrl);

  async function handleSubmit() {
    const today = new Date().toISOString().slice(0, 10);
    const e: Record<string, string> = {};
    if (!risksOk) e.risks = data.risks.includes("Others") ? "Describe the other emergency." : "Select the type of emergency.";
    if (!data.companyName.trim() || !data.contactEmail.includes("@")) e.companyName = "Company and email are required.";
    if (!data.tradeLicenseNo.trim()) e.tradeLicenseNo = "Trade license number is required.";
    if (!data.tradeLicenseExpiry) e.tradeLicenseExpiry = "Trade license expiry is required.";
    else if (data.tradeLicenseExpiry < today) e.tradeLicenseExpiry = "Trade license is expired. Update it before this company can apply.";
    if (!data.tradeLicenseFiles.length && !data.storedLicensePaths.length) e.tradeLicenseFile = "Upload the trade license.";
    const workerMessage = workerFieldError({ ...supervisor, emiratesId: formatEmiratesId(supervisor.emiratesId) });
    if (workerMessage) e.worker = workerMessage;
    if (toDate && supervisor.eidExpiry && !validateEidAfterWorkEnd([supervisor], toDate)) {
      e.worker = "The supervisor's Emirates ID expires before the job ends. Provide an updated ID.";
    }
    if (!timeOk) e.time = "Enter the date and time from and to.";
    if (!data.undertakings.every(Boolean)) e.undertakings = "Confirm each statement.";
    if (!data.declarantName) e.declarantName = "Name is required.";
    if (!data.declarantDesignation) e.declarantDesignation = "Designation is required.";
    if (!data.signatureDataUrl) e.signature = "Draw or upload a signature.";
    setErrors(e);
    if (Object.keys(e).length) {
      notify("Complete the fields still marked in red.", "error");
      return;
    }
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
        ...data.tradeLicenseFiles.map((file) => ({ ...file, name: `Trade-license-${file.name}` })),
        ...(supervisor.eidCopy ? [{ ...supervisor.eidCopy, name: `EID-${supervisor.fullName}-${supervisor.eidCopy.name}` }] : []),
      ],
      data: {
        risks: data.risks,
        riskOther: data.riskOther,
        description: data.risks.includes("Others") ? data.riskOther : data.risks.join(", "),
        tradeLicenseNo: data.tradeLicenseNo,
        tradeLicenseExpiry: data.tradeLicenseExpiry,
        storedTradeLicensePaths: data.storedLicensePaths,
        storedEidCopies: supervisor.eidCopy || !supervisor.storedEidPath ? [] : [{ path: supervisor.storedEidPath, name: supervisor.storedEidName || "Emirates ID" }],
        declarantName: data.declarantName,
        declarantDesignation: data.declarantDesignation,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        timeFrom: fromTime,
        timeTo: toTime,
        undertakings: SECTION_IV_UNDERTAKINGS.filter((_, index) => data.undertakings[index]),
        urgent: true,
        submittedAt: new Date().toISOString(),
      },
      workers: [{
        fullName: supervisor.fullName,
        trade: supervisor.trade || "Supervisor",
        emiratesId: formatEmiratesId(supervisor.emiratesId),
        eidExpiry: supervisor.eidExpiry,
        mobile: supervisor.mobile,
        inductionDone: true,
      }],
    });
    setSubmitting(false);
    if (!res.ok) {
      setErrors({ submit: res.error });
      notify(res.error, "error");
      return;
    }
    notify(res.emailWarning || "Emergency permit submitted. EHS has been emailed.");
    router.push(`/submitted/${encodeURIComponent(res.refNo)}`);
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
        <Mark ok={risksOk}><h3 className="text-lg font-semibold">Type of Emergency / Breakdown *</h3></Mark>
        {EMERGENCY_RISKS.map((risk) => (
          <label key={risk} className="flex min-h-11 items-center gap-2 text-sm">
            <Checkbox
              checked={data.risks.includes(risk)}
              onCheckedChange={(checked) => setData({
                ...data,
                risks: checked ? [...data.risks, risk] : data.risks.filter((item) => item !== risk),
              })}
            />
            {risk}
          </label>
        ))}
        {data.risks.includes("Others") && (
          <Textarea value={data.riskOther} onChange={(event) => setData({ ...data, riskOther: event.target.value })} placeholder="Describe the other emergency" />
        )}
        <FieldError message={errors.risks} />
      </section>

      <section className="grid gap-3 rounded-2xl bg-white/5 p-4 sm:grid-cols-2">
        <Mark ok={Boolean(data.companyName.trim())}>
          <Label>Company name *</Label>
          <Input className="mt-1" value={data.companyName} onChange={(event) => setData({ ...data, companyName: event.target.value })} />
        </Mark>
        <Mark ok={Boolean(data.tradeLicenseNo.trim())}>
          <Label>Trade license no. *</Label>
          <Input className="mt-1" value={data.tradeLicenseNo} onChange={(event) => setData({ ...data, tradeLicenseNo: event.target.value })} />
        </Mark>
        <Mark ok={Boolean(data.tradeLicenseExpiry)}>
          <Label>Trade license expiry *</Label>
          <Input className="mt-1" type="date" value={data.tradeLicenseExpiry} onChange={(event) => setData({ ...data, tradeLicenseExpiry: event.target.value })} />
        </Mark>
        <Mark ok={data.contactEmail.includes("@")}>
          <Label>Email *</Label>
          <Input className="mt-1" type="email" value={data.contactEmail} onChange={(event) => setData({ ...data, contactEmail: event.target.value })} />
        </Mark>
        <div className="sm:col-span-2">
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
        </div>
        <FieldError message={errors.companyName || errors.tradeLicenseNo || errors.tradeLicenseExpiry || errors.tradeLicenseFile} />
      </section>

      <section className="space-y-3 rounded-2xl bg-white/5 p-4">
        <Mark ok={supervisorOk}><h3 className="font-semibold">Supervisor *</h3></Mark>
        <p className="text-xs text-muted-foreground">Emergency entry is for the supervisor only.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Full name *</Label>
            <Input value={supervisor.fullName} onChange={(event) => setSupervisor({ fullName: event.target.value })} />
          </div>
          <div>
            <Label>Designation *</Label>
            <Input value={supervisor.trade} onChange={(event) => setSupervisor({ trade: event.target.value })} />
          </div>
          <div>
            <Label>Emirates ID *</Label>
            <Input placeholder="784-XXXXXXXXXXX-X" value={supervisor.emiratesId} onChange={(event) => setSupervisor({ emiratesId: formatEmiratesId(event.target.value) })} />
          </div>
          <div className="md:col-span-2">
            <PeopleOnFile
              people={savedPeople}
              selectedIds={[supervisor.emiratesId]}
              onPick={(person, checked) => {
                if (!checked) {
                  setSupervisor({ fullName: "", trade: "Supervisor", emiratesId: "", eidExpiry: "", mobile: "", storedEidPath: "", storedEidName: "", eidCopy: undefined });
                  return;
                }
                setSupervisor({
                  fullName: person.fullName,
                  trade: person.trade || "Supervisor",
                  emiratesId: formatEmiratesId(person.emiratesId),
                  eidExpiry: person.eidExpiry,
                  mobile: person.mobile.replace(/\D/g, "").slice(0, 10),
                  storedEidPath: person.eidFilePath,
                  storedEidName: person.eidFileName,
                  eidCopy: undefined,
                });
              }}
            />
          </div>
          <div>
            <Label>EID expiry *</Label>
            <Input type="date" value={supervisor.eidExpiry} onChange={(event) => setSupervisor({ eidExpiry: event.target.value })} />
          </div>
          <div>
            <Label>Mobile *</Label>
            <Input inputMode="numeric" maxLength={10} placeholder="05XXXXXXXX" value={supervisor.mobile} onChange={(event) => setSupervisor({ mobile: event.target.value.replace(/\D/g, "").slice(0, 10) })} />
          </div>
          <div className="md:col-span-2">
            {supervisor.storedEidName && !supervisor.eidCopy && (
              <p className="mb-2 text-sm text-green-700">Emirates ID already on file: {supervisor.storedEidName}</p>
            )}
            <FileUploadField label="Emirates ID copy" files={supervisor.eidCopy ? [supervisor.eidCopy] : []} onChange={(files) => setSupervisor({ eidCopy: files[0], storedEidPath: files[0] ? "" : supervisor.storedEidPath, storedEidName: files[0] ? "" : supervisor.storedEidName })} />
          </div>
        </div>
        <FieldError message={errors.worker} />
      </section>

      <section className="rounded-2xl bg-white/5 p-4">
        <Mark ok={timeOk}><h3 className="font-semibold">Date and time *</h3></Mark>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Date from</Label>
            <Input className="mt-1" type="date" value={fromDate} onChange={(event) => setData({ ...data, validFrom: joinDateTime(event.target.value, fromTime) })} />
          </div>
          <div>
            <Label>Time from</Label>
            <Input className="mt-1" type="time" value={fromTime} onChange={(event) => setData({ ...data, validFrom: joinDateTime(fromDate, event.target.value) })} />
          </div>
          <div>
            <Label>Date to</Label>
            <Input className="mt-1" type="date" value={toDate} onChange={(event) => setData({ ...data, validUntil: joinDateTime(event.target.value, toTime) })} />
          </div>
          <div>
            <Label>Time to</Label>
            <Input className="mt-1" type="time" value={toTime} onChange={(event) => setData({ ...data, validUntil: joinDateTime(toDate, event.target.value) })} />
          </div>
        </div>
        <FieldError message={errors.time} />
      </section>

      <section className="space-y-3 rounded-2xl bg-white/5 p-4">
        <Mark ok={signOk}><h3 className="font-semibold">Undertaking and signature *</h3></Mark>
        {SECTION_IV_UNDERTAKINGS.map((text, index) => (
          <label key={text} className="flex gap-2 text-sm">
            <Checkbox
              checked={data.undertakings[index]}
              onCheckedChange={(checked) => {
                const next = [...data.undertakings];
                next[index] = checked === true;
                setData({ ...data, undertakings: next });
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
        <FieldError message={errors.undertakings || errors.declarantName || errors.declarantDesignation} />
      </section>

      <section className="pointer-events-none space-y-2 rounded-2xl border border-dashed border-white/20 bg-black/20 p-4 opacity-70">
        <h3 className="font-semibold text-foreground">Safety requirements</h3>
        <p className="text-xs text-muted-foreground">Set by the EHS officer in the admin panel. Contractors cannot change this section.</p>
        {SAFETY_CONTROLS.map((item) => (
          <label key={item} className="flex gap-2 text-sm text-muted-foreground">
            <Checkbox checked={false} disabled />
            {item}
          </label>
        ))}
        <h3 className="pt-2 font-semibold text-foreground">SMA approval</h3>
        <p className="text-xs text-muted-foreground">Approval, conditions, and the gate pass signature are completed by EHS after this form is submitted.</p>
      </section>

      <input className="hidden" tabIndex={-1} autoComplete="off" value={data.honeypot} onChange={(event) => setData({ ...data, honeypot: event.target.value })} />
      <FieldError message={errors.submit} />
      <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Submitting…" : "Submit"}</Button>
      {!companyOk || !risksOk || !supervisorOk || !timeOk || !signOk ? (
        <p className="text-center text-xs text-red-300">Complete every red field before submitting.</p>
      ) : (
        <p className="text-center text-xs text-green-300">Required details are complete. You can submit.</p>
      )}
    </form>
  );
}
