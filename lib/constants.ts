export const TRADE_DESIGNATIONS = [
  "Supervisor",
  "Technician",
  "Electrician",
  "Plumber",
  "HVAC Technician",
  "Welder",
  "Fitter",
  "Carpenter",
  "Painter",
  "Mason",
  "Scaffolder",
  "Rigger",
  "Crane Operator",
  "Helper",
  "Cleaner",
  "Driver",
  "Other",
] as const;

export const UAE_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;

export const VEHICLE_TYPES = [
  "Pickup",
  "Van",
  "Truck",
  "Car",
  "Crane",
  "Forklift",
  "Other",
] as const;

export const EID_REGEX = /^784-\d{4}-\d{7}-\d$/;

export const MOBILE_REGEX = /^(05\d{8}|\+9715\d{8})$/;

export const APPROVAL_CONTACTS = [
  "khalifa.alnaqbi@sma.ac.ae",
  "mohammed.hassan@uae.g4s.com",
] as const;

export const SECTION_IV_UNDERTAKINGS = [
  "I confirm that all required safety precautions are in place, and I am fully responsible for their implementation.",
  "I confirm that the number of workers on site will not exceed the maximum approved, and that all workers listed hold a valid Emirates ID.",
  "I confirm that all information provided has been reviewed prior to submission to SMA management, and that it is true and accurate.",
  "I confirm that I have read and understood the health, safety and environment requirements of this permit.",
] as const;

export const FORM_REFS = {
  gate_pass: "EHSQ/SMA/2026/GP/Form-08 Rev.00",
  ptw_standard: "EHSQ/SMA/2026/PTW/Form-07 Rev.01",
  ptw_emergency: "EHSQ/SMA/2026/PTW/Form-07A Rev.00",
} as const;

export const EHS_INBOX = "ehs@sma.ac.ae";

export const DUBAI_TZ = "Asia/Dubai";
