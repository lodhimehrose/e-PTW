"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormWizard } from "@/components/form-wizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { WorkersEditor } from "@/components/workers-editor";
import { FieldError } from "@/components/field-error";
import { SignaturePadField } from "@/components/signature-pad";
import { FileUploadField } from "@/components/file-upload-field";
import { useFormDraft } from "@/hooks/use-form-draft";
import { lookupPermitRef, submitForm } from "@/app/actions/submissions";
import type { FilePayload } from "@/app/actions/submissions";
import {
  validateEidAfterWorkEnd,
  validateWorkersEidUnique,
  workerSchema,
  type WorkerInput,
} from "@/lib/validations/worker";
import { UAE_EMIRATES, VEHICLE_TYPES } from "@/lib/constants";
import { format } from "date-fns";

type VehicleRow = {
  vehicleType: string;
  plateNo: string;
  emirate: string;
  driverName: string;
  licenseNo: string;
  licenseExpiry: string;
};

type ToolRow = { description: string; quantity: string; serialId: string };

type GatePassDraft = {
  companyName: string;
  tradeLicenseNo: string;
  tradeLicenseExpiry: string;
  linkedPermitRef: string;
  permitType: string;
  supervisorName: string;
  supervisorContact: string;
  emergencyName: string;
  emergencyContact: string;
  department: string;
  purpose: string;
  building: string;
  entryFrom: string;
  entryTo: string;
  hoursFrom: string;
  hoursTo: string;
  contactEmail: string;
  workers: WorkerInput[];
  vehicles: VehicleRow[];
  tools: ToolRow[];
  declaration: boolean;
  declarantName: string;
  signatureDataUrl?: string;
  uploads: FilePayload[];
  honeypot: string;
};

const initial: GatePassDraft = {
  companyName: "",
  tradeLicenseNo: "",
  tradeLicenseExpiry: "",
  linkedPermitRef: "",
  permitType: "",
  supervisorName: "",
  supervisorContact: "",
  emergencyName: "",
  emergencyContact: "",
  department: "",
  purpose: "",
  building: "",
  entryFrom: "",
  entryTo: "",
  hoursFrom: "08:00",
  hoursTo: "17:00",
  contactEmail: "",
  workers: [
    {
      fullName: "",
      trade: "",
      emiratesId: "",
      eidExpiry: "",
      mobile: "",
      inductionDone: "no",
    },
  ],
  vehicles: [],
  tools: [],
  declaration: false,
  declarantName: "",
  uploads: [],
  honeypot: "",
};

const STEPS = [
  "Company information",
  "Workforce",
  "Vehicles",
  "Tools & materials",
  "Declaration",
];

export function GatePassForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { data, setData, clearDraft, hydrated } = useFormDraft(
    "draft-gate-pass",
    initial,
  );
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [maxWorkers, setMaxWorkers] = useState<number | undefined>();
  const [permitRange, setPermitRange] = useState<{ start?: string; end?: string }>(
    {},
  );

  useEffect(() => {
    const permit = search.get("permit");
    if (permit && hydrated && !data.linkedPermitRef) {
      setData((d) => ({ ...d, linkedPermitRef: permit }));
      void lookupPermit(permit);
    }
  }, [search, hydrated]);

  async function lookupPermit(ref: string) {
    const res = await lookupPermitRef(ref);
    if (!res.ok) {
      setErrors((e) => ({ ...e, linkedPermitRef: res.error }));
      return;
    }
    const p = res.permit;
    setMaxWorkers(p.maxWorkers ?? undefined);
    setPermitRange({
      start: p.startAt?.slice(0, 10),
      end: p.endAt?.slice(0, 10),
    });
    setData((d) => ({
      ...d,
      linkedPermitRef: p.refNo,
      permitType: p.type === "ptw_emergency" ? "Emergency" : "Standard",
      companyName: p.companyName ?? d.companyName,
      building: p.building ?? d.building,
      entryFrom: p.startAt?.slice(0, 10) ?? d.entryFrom,
      entryTo: p.endAt?.slice(0, 10) ?? d.entryTo,
    }));
  }

  const workEnd = data.entryTo || permitRange.end;

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!data.companyName) e.companyName = "Required";
      if (!data.tradeLicenseNo) e.tradeLicenseNo = "Required";
      if (!data.tradeLicenseExpiry) e.tradeLicenseExpiry = "Required";
      else if (new Date(data.tradeLicenseExpiry) < new Date())
        e.tradeLicenseExpiry = "Trade license is expired";
      if (!data.linkedPermitRef) e.linkedPermitRef = "Required";
      if (!data.supervisorName) e.supervisorName = "Required";
      if (!data.supervisorContact) e.supervisorContact = "Required";
      if (!data.emergencyName) e.emergencyName = "Required";
      if (!data.emergencyContact) e.emergencyContact = "Required";
      if (!data.department) e.department = "Required";
      if (!data.purpose) e.purpose = "Required";
      if (!data.building) e.building = "Required";
      if (!data.entryFrom || !data.entryTo) e.entryTo = "Entry dates required";
      if (permitRange.start && data.entryFrom < permitRange.start)
        e.entryFrom = "Must be within permit dates";
      if (permitRange.end && data.entryTo > permitRange.end)
        e.entryTo = "Must be within permit dates";
      if (!data.contactEmail) e.contactEmail = "Required";
    }
    if (s === 2) {
      data.workers.forEach((w, i) => {
        const r = workerSchema.safeParse(w);
        if (!r.success) e[`workers.${i}`] = "Complete all worker fields";
      });
      if (!validateWorkersEidUnique(data.workers))
        e.workers = "Duplicate Emirates ID in this submission";
      if (workEnd && !validateEidAfterWorkEnd(data.workers, workEnd))
        e.workers = "Emirates ID expires before the work ends";
      if (maxWorkers && data.workers.length > maxWorkers)
        e.workers = `Maximum ${maxWorkers} workers on linked permit`;
    }
    if (s === 5) {
      if (!data.declaration) e.declaration = "You must confirm the declaration";
      if (!data.declarantName) e.declarantName = "Required";
      if (!data.signatureDataUrl) e.signature = "Signature required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validateStep(5)) return;
    setSubmitting(true);
    const res = await submitForm({
      type: "gate_pass",
      honeypot: data.honeypot,
      companyName: data.companyName,
      contactEmail: data.contactEmail,
      building: data.building,
      startAt: data.entryFrom,
      endAt: data.entryTo,
      maxWorkers: maxWorkers,
      linkedRefNo: data.linkedPermitRef,
      signatureDataUrl: data.signatureDataUrl,
      documents: data.uploads,
      data: { ...data, submittedAt: new Date().toISOString() },
      workers: data.workers.map((w) => ({
        fullName: w.fullName,
        trade: w.trade === "Other" ? w.tradeOther || "Other" : w.trade,
        emiratesId: w.emiratesId,
        eidExpiry: w.eidExpiry,
        mobile: w.mobile,
        inductionDone: w.inductionDone === "yes",
      })),
      vehicles: data.vehicles,
      tools: data.tools,
    });
    setSubmitting(false);
    if (!res.ok) {
      setErrors({ submit: res.error });
      return;
    }
    clearDraft();
    router.push(`/submitted/${encodeURIComponent(res.refNo)}`);
  }

  const review = useMemo(() => data, [data]);

  if (!hydrated) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <FormWizard
      step={step}
      totalSteps={STEPS.length}
      stepTitle={STEPS[step - 1]}
      onBack={() => setStep((s) => Math.max(1, s - 1))}
      onNext={() => {
        if (validateStep(step)) setStep((s) => s + 1);
      }}
      isLast={step === STEPS.length}
      onSubmit={handleSubmit}
      submitting={submitting}
    >
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        value={data.honeypot}
        onChange={(e) => setData({ ...data, honeypot: e.target.value })}
      />

      {step === 1 && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 rounded-md bg-sma-grey p-3 text-xs text-muted-foreground">
            A Gate Pass is required for all contractor personnel, vehicles, tools and materials entering SMA premises, and must match an approved Permit to Work.
          </div>
          <div className="md:col-span-2">
            <Label>Linked permit reference no. *</Label>
            <div className="flex gap-2">
              <Input
                value={data.linkedPermitRef}
                onChange={(e) =>
                  setData({ ...data, linkedPermitRef: e.target.value.toUpperCase() })
                }
              />
              <Button type="button" variant="outline" onClick={() => lookupPermit(data.linkedPermitRef)}>
                Lookup
              </Button>
            </div>
            <FieldError message={errors.linkedPermitRef} />
          </div>
          <div>
            <Label>Permit type</Label>
            <Input readOnly value={data.permitType} />
          </div>
          <div>
            <Label>Company name *</Label>
            <Input
              value={data.companyName}
              onChange={(e) => setData({ ...data, companyName: e.target.value })}
            />
            <FieldError message={errors.companyName} />
          </div>
          <div>
            <Label>Trade license no. *</Label>
            <Input
              value={data.tradeLicenseNo}
              onChange={(e) => setData({ ...data, tradeLicenseNo: e.target.value })}
            />
          </div>
          <div>
            <Label>Trade license expiry *</Label>
            <Input
              type="date"
              value={data.tradeLicenseExpiry}
              onChange={(e) =>
                setData({ ...data, tradeLicenseExpiry: e.target.value })
              }
            />
            <FieldError message={errors.tradeLicenseExpiry} />
          </div>
          <div>
            <Label>Site supervisor / PIC *</Label>
            <Input
              value={data.supervisorName}
              onChange={(e) => setData({ ...data, supervisorName: e.target.value })}
            />
          </div>
          <div>
            <Label>Supervisor contact *</Label>
            <Input
              value={data.supervisorContact}
              onChange={(e) =>
                setData({ ...data, supervisorContact: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Emergency contact name *</Label>
            <Input
              value={data.emergencyName}
              onChange={(e) => setData({ ...data, emergencyName: e.target.value })}
            />
          </div>
          <div>
            <Label>Emergency contact no. *</Label>
            <Input
              value={data.emergencyContact}
              onChange={(e) =>
                setData({ ...data, emergencyContact: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label>SMA requesting department *</Label>
            <Input
              value={data.department}
              onChange={(e) => setData({ ...data, department: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Purpose of visit / work *</Label>
            <Textarea
              value={data.purpose}
              onChange={(e) => setData({ ...data, purpose: e.target.value })}
            />
          </div>
          <div>
            <Label>Building / location *</Label>
            <Input
              value={data.building}
              onChange={(e) => setData({ ...data, building: e.target.value })}
            />
          </div>
          <div>
            <Label>Max workers on permit</Label>
            <Input readOnly value={maxWorkers ?? "—"} />
          </div>
          <div>
            <Label>Entry date from *</Label>
            <Input
              type="date"
              value={data.entryFrom}
              onChange={(e) => setData({ ...data, entryFrom: e.target.value })}
            />
            <FieldError message={errors.entryFrom} />
          </div>
          <div>
            <Label>Entry date to *</Label>
            <Input
              type="date"
              value={data.entryTo}
              onChange={(e) => setData({ ...data, entryTo: e.target.value })}
            />
            <FieldError message={errors.entryTo} />
          </div>
          <div>
            <Label>Working hours from *</Label>
            <Input
              type="time"
              value={data.hoursFrom}
              onChange={(e) => setData({ ...data, hoursFrom: e.target.value })}
            />
          </div>
          <div>
            <Label>Working hours to *</Label>
            <Input
              type="time"
              value={data.hoursTo}
              onChange={(e) => setData({ ...data, hoursTo: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Contact email *</Label>
            <Input
              type="email"
              value={data.contactEmail}
              onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
            />
            <FieldError message={errors.contactEmail} />
          </div>
        </div>
      )}

      {step === 2 && (
        <>
          <WorkersEditor
            workers={data.workers}
            onChange={(w) => setData({ ...data, workers: w })}
            workEndDate={workEnd}
            maxWorkers={maxWorkers}
            errors={errors}
          />
          <FieldError message={errors.workers} />
        </>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Optional — add vehicles if any.</p>
          {data.vehicles.map((v, i) => (
            <div key={i} className="grid gap-2 rounded border p-3 md:grid-cols-2">
              <Input
                placeholder="Plate no."
                value={v.plateNo}
                onChange={(e) => {
                  const vehicles = [...data.vehicles];
                  vehicles[i] = { ...v, plateNo: e.target.value };
                  setData({ ...data, vehicles });
                }}
              />
              <select
                className="h-11 rounded-md border px-3"
                value={v.vehicleType}
                onChange={(e) => {
                  const vehicles = [...data.vehicles];
                  vehicles[i] = { ...v, vehicleType: e.target.value };
                  setData({ ...data, vehicles });
                }}
              >
                <option value="">Vehicle type</option>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setData({
                ...data,
                vehicles: [
                  ...data.vehicles,
                  {
                    vehicleType: "",
                    plateNo: "",
                    emirate: UAE_EMIRATES[2],
                    driverName: "",
                    licenseNo: "",
                    licenseExpiry: "",
                  },
                ],
              })
            }
          >
            Add vehicle
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Optional tools and materials.</p>
          {data.tools.map((t, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-3">
              <Input
                placeholder="Description"
                value={t.description}
                onChange={(e) => {
                  const tools = [...data.tools];
                  tools[i] = { ...t, description: e.target.value };
                  setData({ ...data, tools });
                }}
              />
              <Input
                placeholder="Qty"
                value={t.quantity}
                onChange={(e) => {
                  const tools = [...data.tools];
                  tools[i] = { ...t, quantity: e.target.value };
                  setData({ ...data, tools });
                }}
              />
              <Input
                placeholder="Serial / ID"
                value={t.serialId}
                onChange={(e) => {
                  const tools = [...data.tools];
                  tools[i] = { ...t, serialId: e.target.value };
                  setData({ ...data, tools });
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setData({
                ...data,
                tools: [...data.tools, { description: "", quantity: "", serialId: "" }],
              })
            }
          >
            Add item
          </Button>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <div className="rounded-md bg-sma-grey p-3 text-xs">
            <p className="font-medium text-sma-navy">Review</p>
            <p>Company: {review.companyName}</p>
            <p>Permit: {review.linkedPermitRef}</p>
            <p>Workers: {review.workers.length}</p>
            <p>Entry: {review.entryFrom} → {review.entryTo}</p>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              checked={data.declaration}
              onCheckedChange={(c) => setData({ ...data, declaration: c === true })}
            />
            <p className="text-sm">
              I confirm that all workers listed hold a valid Emirates ID, are employed by or under the control of our company, have been briefed on the permit conditions, and will leave SMA premises at the end of the approved working hours.
            </p>
          </div>
          <FieldError message={errors.declaration} />
          <div>
            <Label>Name *</Label>
            <Input
              value={data.declarantName}
              onChange={(e) => setData({ ...data, declarantName: e.target.value })}
            />
            <FieldError message={errors.declarantName} />
          </div>
          <SignaturePadField
            error={errors.signature}
            onChange={(url) => setData({ ...data, signatureDataUrl: url })}
          />
          <FileUploadField
            label="Optional: worker list or EID copies"
            files={data.uploads}
            onChange={(f) => setData({ ...data, uploads: f })}
            multiple
          />
          <p className="text-sm text-muted-foreground">
            Date: {format(new Date(), "dd MMM yyyy")}
          </p>
          <FieldError message={errors.submit} />
        </div>
      )}
    </FormWizard>
  );
}
