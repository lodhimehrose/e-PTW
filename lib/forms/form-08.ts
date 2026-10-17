import type { FormDefinition } from "./shared";

const declaration = "I confirm that all workers listed hold a valid Emirates ID, are employed by or under the control of our company, have been briefed on the permit conditions, and will leave SMA premises at the end of the approved working hours.";

export const form08: FormDefinition = {
  id: "form-08",
  title: "CONTRACTOR GATE PASS",
  reference: "Ref No: EHSQ/SMA/2026/GP/Form-08 Rev.00",
  numberLabel: "Gate Pass No.:",
  instructions: [
    "A Gate Pass is required for all contractor personnel, vehicles, tools and materials entering SMA premises.",
    "Valid only with an approved Permit to Work (Standard Form-07), and only for the dates and hours approved.",
    "Number of workers listed shall not exceed the maximum approved on the linked Permit to Work.",
    "Every worker shall carry an original, valid Emirates ID. Expired EID will be refused entry.",
  ],
  sections: [
    {
      id: "company",
      code: "SECTION I",
      title: "COMPANY INFORMATION",
      fields: [
        { key: "companyName", label: "Company Name", type: "text", span: 12 },
        { key: "tradeLicenseNo", label: "Trade License No.", type: "text", span: 6 },
        { key: "tradeLicenseExpiry", label: "License Expiry", type: "date", span: 6 },
        { key: "permitType", label: "Permit Type", type: "text", span: 8 },
        { key: "sourcePermit", label: "Linked Permit No.", type: "text", span: 8 },
        { key: "supervisorName", label: "Site Supervisor / In-Charge", type: "text", span: 8 },
        { key: "supervisorPhone", label: "Contact No.", type: "text", span: 8 },
        { key: "department", label: "SMA Requesting Dept. / By", type: "text", span: 8 },
        { key: "building", label: "Building / Location", type: "text", span: 8 },
        { key: "purpose", label: "Purpose of Visit / Work", type: "textarea", span: 24 },
        { key: "entryFrom", label: "Entry date from", type: "date", span: 6 },
        { key: "entryTo", label: "Entry date to", type: "date", span: 6 },
        { key: "hoursFrom", label: "Working hours from", type: "time", span: 6 },
        { key: "hoursTo", label: "Working hours to", type: "time", span: 6 },
        { key: "workerCount", label: "Total workers (this pass)", type: "number", span: 8 },
        { key: "maxWorkers", label: "Max. workers on permit", type: "number", span: 8 },
      ],
    },
    {
      id: "workers",
      code: "SECTION II",
      title: "WORKFORCE",
      fields: [{ key: "workers", label: "Workers", type: "table", span: 24 }],
    },
    {
      id: "vehicles",
      code: "SECTION III",
      title: "VEHICLE DETAILS",
      fields: [{ key: "vehicles", label: "Vehicles", type: "table", span: 24 }],
    },
    {
      id: "tools",
      code: "SECTION IV",
      title: "TOOLS, EQUIPMENT & MATERIALS",
      fields: [{ key: "tools", label: "Tools", type: "table", span: 24 }],
    },
    {
      id: "declaration",
      code: "SECTION V",
      title: "CONTRACTOR DECLARATION",
      fields: [
        { key: "declaration", label: declaration, type: "statement", span: 24 },
        { key: "declarantName", label: "Name", type: "text", span: 8 },
        { key: "signature", label: "Signature", type: "signature", span: 8 },
        { key: "signedDate", label: "Date", type: "date", span: 8 },
      ],
    },
    {
      id: "approval",
      code: "SECTION VI",
      title: "FOR SMA APPROVAL",
      fields: [{ key: "approval", label: "Health & Safety decision", type: "text", span: 24 }],
    },
    {
      id: "gate-log",
      code: "SECTION VII",
      title: "GATE ENTRY / EXIT LOG",
      fields: [{ key: "gateLog", label: "Gate log", type: "table", span: 24 }],
    },
  ],
  hse: [],
};

export const form08a: FormDefinition = {
  ...form08,
  id: "form-08a",
  title: "CONTRACTOR EMERGENCY GATE PASS",
  reference: "Ref No: EHSQ/SMA/2026/GP/Form-08A Rev.00",
  instructions: [
    "Valid only with an approved Emergency / Breakdown Permit to Work (Form-07A), and only for the dates and hours approved.",
    "Entry is limited to the emergency permit window (maximum 12 hours).",
    "This pass lists the supervisor. Expired Emirates ID will be refused entry.",
  ],
  sections: form08.sections.map((section) =>
    section.id === "workers" ? { ...section, title: "SUPERVISOR" } : section,
  ),
};
