import { HSE_SECTIONS } from "@/lib/hse-requirements";
import { optionList, type FormDefinition } from "./shared";

export const LIGHT_WORK_OPTIONS = [
  "Light maintenance works",
  "Minor repair works",
  "Routine PPM/RM",
  "CCTV / IT / System related work",
  "Others",
];

export const CRITICAL_WORK_OPTIONS = [
  "Hot work (Welding / Grinding)",
  "Excavation (≥ 30 cm)",
  "Work at height (1.8 m and above)",
  "Entry into Confined Space",
  "Isolation / impairment of fire life safety system",
  "Crane / Hoist operation",
  "Fit-out / modification work",
  "Work on/near unprotected energized system / LV & HV room",
];

export const FORM_07_UNDERTAKINGS = [
  { key: "u1", text: "I confirm that all required safety precautions are in place, and I am fully responsible for their implementation." },
  { key: "u2", text: "I confirm that the number of workers on site will not exceed the maximum approved in Section II-F, and that all workers listed in Section III hold a valid Emirates ID." },
  { key: "u3", text: "I confirm that all information provided has been reviewed prior to submission to SMA management, and that it is true and accurate." },
  { key: "u4", text: "I confirm that I have read and understood Section VI of this work permit application." },
];

export const form07: FormDefinition = {
  id: "form-07",
  title: "STANDARD PERMIT TO WORK",
  reference: "Ref No: EHSQ/SMA/2026/PTW/Form-07 Rev.01",
  numberLabel: "Work Permit No.:",
  instructions: [
    "The work permit is required for any planned work taking place on SMA premises.",
    "Submit the permit at least 3 working days before the work starts, together with the Contractor Gate Pass (Form-08).",
    "The permit is valid for a maximum of 7 days and shall be revalidated by EHS every working day.",
    "The number of workers on site shall not exceed the maximum approved, and every worker shall be listed. Extra or unlisted workers will be refused entry.",
  ],
  sections: [
    {
      id: "applicant",
      code: "SECTION I",
      title: "APPLICANT INFORMATION",
      fields: [
        { key: "companyName", label: "Company Name", type: "text", span: 12 },
        { key: "tradeLicenseNo", label: "Trade License No.", type: "text", span: 6 },
        { key: "tradeLicenseExpiry", label: "License Expiry", type: "date", span: 6 },
        { key: "applicantName", label: "Name of Applicant", type: "text", span: 8 },
        { key: "designation", label: "Designation", type: "text", span: 8 },
        { key: "applicantEmail", label: "Applicant Email", type: "text", span: 8 },
        { key: "applicantPhone", label: "Applicant Contact No.", type: "text", span: 8 },
        { key: "supervisorName", label: "Site Supervisor / Person-in-Charge", type: "text", span: 8 },
        { key: "supervisorPhone", label: "Site Contact No.", type: "text", span: 8 },
        { key: "department", label: "SMA Requesting Dept.", type: "text", span: 12 },
        { key: "building", label: "Building / Location", type: "text", span: 12 },
      ],
    },
    {
      id: "work",
      code: "SECTION II",
      title: "WORK APPLICATION DETAILS",
      fields: [
        { key: "workType", label: "A) Type of Work — tick for EHSQ", type: "checkboxGroup", span: 24, options: optionList(["Light Works", "Critical Works"]) },
        { key: "lightWorks", label: "Normal activity", type: "checkboxGroup", span: 24, options: optionList(LIGHT_WORK_OPTIONS) },
        { key: "criticalWorks", label: "Critical works", type: "checkboxGroup", span: 24, options: optionList(CRITICAL_WORK_OPTIONS) },
        { key: "workDescription", label: "Detailed description of the nature & scope of work", type: "textarea", span: 24 },
        { key: "startDate", label: "Date from", type: "date", span: 6 },
        { key: "endDate", label: "Date to", type: "date", span: 6 },
        { key: "timeFrom", label: "Time from", type: "time", span: 6 },
        { key: "timeTo", label: "Time to", type: "time", span: 6 },
        { key: "floorArea", label: "Building / floor / area", type: "text", span: 24 },
        { key: "ppe", label: "C) PPE & Safety Equipment", type: "checkboxGroup", span: 24, options: optionList(["Fire extinguishers", "Safety helmet & safety shoes", "Safety vest", "Full body harness (double lanyard)", "Gas detector", "Ear plugs / mask / gloves", "Warning signs / safety barriers", "Others"]) },
        { key: "equipment", label: "D) Equipment Required", type: "checkboxGroup", span: 24, options: optionList(["Mobile Elevating Work Platform (MEWP)", "Scaffolding", "Ladder", "Mobile Crane", "Forklift", "Welding / cutting set", "Others"]) },
        { key: "documents", label: "E) Documents to be Attached", type: "fileList", span: 24 },
        { key: "maxWorkers", label: "Maximum no. of workers allowed on site", type: "number", span: 8 },
        { key: "workers", label: "F) Workforce on site", type: "table", span: 24 },
      ],
    },
    {
      id: "undertaking",
      code: "SECTION IV",
      title: "UNDERTAKING AND AFFIRMATION",
      fields: FORM_07_UNDERTAKINGS.map((item) => ({ key: item.key, label: item.text, type: "statement" as const, span: 24 })),
    },
    {
      id: "sign",
      code: "SECTION IV",
      title: "SIGNATURE",
      fields: [
        { key: "declarantName", label: "Name", type: "text", span: 8 },
        { key: "declarantDesignation", label: "Designation", type: "text", span: 8 },
        { key: "signature", label: "Signature", type: "signature", span: 8 },
      ],
    },
    {
      id: "approval",
      code: "SECTION V",
      title: "FOR SMA APPROVAL",
      fields: [
        { key: "approval", label: "Health & Safety / FM Engineer / Security & Protocol", type: "text", span: 24 },
      ],
    },
  ],
  hse: HSE_SECTIONS.map((section) => ({ id: section.id, title: section.title, items: section.items })),
  scaffoldTags: ["GREEN TAG – Safe for use", "YELLOW TAG – Use with caution / harness required", "RED TAG – Do not use"],
};
