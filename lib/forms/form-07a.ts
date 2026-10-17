import { optionList, type FormDefinition } from "./shared";
import { form07 } from "./form-07";

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
        { key: "description", label: "Description of the breakdown / emergency", type: "textarea", span: 24 },
        { key: "risks", label: "Immediate risk if not attended", type: "checkboxGroup", span: 24, options: optionList(["Safety of people", "Fire / life safety", "Water leak / flooding", "Power failure", "Person trapped in lift", "Security breach", "Critical SMA operations", "Others"]) },
        { key: "companyName", label: "Company Name", type: "text", span: 12 },
        { key: "tradeLicenseNo", label: "Trade License No.", type: "text", span: 6 },
        { key: "tradeLicenseExpiry", label: "License Expiry", type: "date", span: 6 },
        { key: "reportedBy", label: "Reported by", type: "text", span: 12 },
        { key: "department", label: "SMA Requesting Dept.", type: "text", span: 12 },
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
        { key: "validFrom", label: "Permit valid from", type: "text", span: 12 },
        { key: "validUntil", label: "Valid until (max 12 hrs)", type: "text", span: 12 },
        { key: "supervisor", label: "Supervisor", type: "table", span: 24 },
      ],
    },
    {
      id: "controls",
      code: "SECTION III",
      title: "IMMEDIATE SAFETY CONTROLS",
      fields: [
        { key: "safetyControls", label: "Confirmed before work starts", type: "checkboxGroup", span: 24, options: optionList(["Area barricaded and warning signs placed", "Fire extinguisher available at the work point", "Occupants moved away from the affected area", "Fire watch arranged if fire systems are impaired", "Energy sources isolated, locked and tagged (LOTO)", "Workers briefed on hazards (toolbox talk)", "Correct PPE worn by all workers", "SMA Security informed of workers and access route"]) },
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
      code: "SECTION IV",
      title: "SIGNATURE",
      fields: [
        { key: "declarantName", label: "Name", type: "text", span: 8 },
        { key: "declarantDesignation", label: "Designation", type: "text", span: 8 },
        { key: "signature", label: "Signature", type: "signature", span: 8 },
      ],
    },
  ],
  hse: form07.hse,
  scaffoldTags: form07.scaffoldTags,
};
