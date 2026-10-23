import { optionList, type FormDefinition } from "./shared";
import { CRITICAL_WORK_OPTIONS, form07, LIGHT_WORK_OPTIONS } from "./form-07";
import { SAFETY_CONTROLS } from "@/lib/safety-controls";

export const form07a: FormDefinition = {
  id: "form-07a",
  title: "EMERGENCY / BREAKDOWN PERMIT TO WORK",
  reference: "Ref No: EHSQ/SMA/2026/PTW/Form-07A Rev.00",
  numberLabel: "E-PTW No.:",
  instructions: [
    "This permit is used only for unplanned breakdowns or emergencies that cannot wait 3 working days.",
    "Planned, routine or delayed works require the Standard Permit to Work (Form-07).",
    "The permit is valid for a maximum of 12 hours or until the end of the shift, whichever comes first.",
    "All workers are registered at the security gate through the Emergency Gate Pass (Form-08A). This permit records the supervisor only.",
  ],
  sections: [
    {
      id: "emergency",
      code: "SECTION I",
      title: "EMERGENCY / BREAKDOWN DETAILS",
      fields: [
        { key: "risks", label: "Immediate risk if not attended", type: "checkboxGroup", span: 24, options: optionList(["Safety of people", "Fire / life safety", "Water leak / flooding", "Power failure", "Person trapped in lift", "Security breach", "Critical SMA operations", "Others"]) },
        { key: "companyName", label: "Company Name", type: "text", span: 12 },
        { key: "tradeLicenseNo", label: "Trade License No.", type: "text", span: 6 },
        { key: "tradeLicenseExpiry", label: "License Expiry", type: "date", span: 6 },
        { key: "building", label: "Building / Location", type: "text", span: 12 },
        { key: "contactEmail", label: "Contact email", type: "text", span: 12 },
      ],
    },
    {
      id: "scope",
      code: "SECTION II",
      title: "WORK SCOPE & HAZARDS",
      fields: [
        { key: "workScope", label: "Work to be done (make-safe / repair)", type: "textarea", span: 24 },
        { key: "workType", label: "Type of work — tick for EHSQ", type: "checkboxGroup", span: 24, options: optionList(["Light Works", "Critical Works"]) },
        { key: "lightWorks", label: "Normal activity", type: "checkboxGroup", span: 24, options: optionList(LIGHT_WORK_OPTIONS) },
        { key: "criticalWorks", label: "Critical works", type: "checkboxGroup", span: 24, options: optionList(CRITICAL_WORK_OPTIONS) },
        { key: "validFrom", label: "Permit valid from", type: "text", span: 8 },
        { key: "timeFrom", label: "Time from", type: "time", span: 4 },
        { key: "validUntil", label: "Valid until (max 12 hrs)", type: "text", span: 8 },
        { key: "timeTo", label: "Time to", type: "time", span: 4 },
        { key: "supervisor", label: "Supervisor", type: "table", span: 24 },
      ],
    },
    {
      id: "controls",
      code: "SECTION III",
      title: "IMMEDIATE SAFETY CONTROLS",
      fields: [
        { key: "safetyControls", label: "Confirmed before work starts", type: "checkboxGroup", span: 24, options: optionList(SAFETY_CONTROLS) },
      ],
    },
    {
      id: "undertaking",
      code: "SECTION IV",
      title: "UNDERTAKING AND AFFIRMATION",
      fields: form07.sections.find((section) => section.id === "undertaking")?.fields ?? [],
    },
    {
      id: "sign",
      code: "SECTION V",
      title: "SIGNATURE",
      fields: form07.sections.find((section) => section.id === "sign")?.fields ?? [],
    },
  ],
  hse: form07.hse,
  scaffoldTags: form07.scaffoldTags,
};
