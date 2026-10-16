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

export const FORM_REFS = {
  gate_pass: "EHSQ/SMA/2026/GP/Form-08 Rev.00",
  ptw_standard: "EHSQ/SMA/2026/PTW/Form-07 Rev.01",
  ptw_emergency: "EHSQ/SMA/2026/PTW/Form-07A Rev.00",
} as const;

export const DUBAI_TZ = "Asia/Dubai";
