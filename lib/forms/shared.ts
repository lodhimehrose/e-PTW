export type FieldType =
  | "text"
  | "date"
  | "time"
  | "number"
  | "textarea"
  | "checkboxGroup"
  | "radio"
  | "yesNoRemarks"
  | "table"
  | "statement"
  | "signature"
  | "fileList";

export type FormOption = { key: string; label: string };

export type FormField = {
  key: string;
  label: string;
  type: FieldType;
  options?: FormOption[];
  span?: number;
  note?: string;
};

export type FormSection = {
  id: string;
  code: string;
  title: string;
  fields: FormField[];
  note?: string;
};

export type HseBlock = { id: string; title: string; items: string[] };

export type FormDefinition = {
  id: "form-07" | "form-07a" | "form-08" | "form-08a";
  title: string;
  reference: string;
  numberLabel: string;
  instructions: string[];
  sections: FormSection[];
  hse: HseBlock[];
  scaffoldTags?: string[];
};

export type StatementRecord = {
  key: string;
  text: string;
  accepted: boolean;
  acceptedAt?: string;
};

export function optionList(labels: string[]): FormOption[] {
  return labels.map((label) => ({
    key: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    label,
  }));
}

export function selectedKeys(value: unknown, options: FormOption[]) {
  const raw = Array.isArray(value) ? value.map(String) : typeof value === "string" && value ? [value] : [];
  const chosen = new Set(raw.map((item) => item.toLowerCase()));
  return options.filter(
    (option) => chosen.has(option.key.toLowerCase()) || chosen.has(option.label.toLowerCase()),
  ).map((option) => option.key);
}

export function statementsFrom(value: unknown, texts: { key: string; text: string }[]): StatementRecord[] {
  if (Array.isArray(value) && value.every((item) => item && typeof item === "object" && "text" in item)) {
    return value as StatementRecord[];
  }
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    const accepted = new Set(value);
    return texts.map((item) => ({ ...item, accepted: accepted.has(item.text) }));
  }
  if (Array.isArray(value) && value.every((item) => typeof item === "boolean")) {
    return texts.map((item, index) => ({ ...item, accepted: Boolean(value[index]) }));
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, boolean>;
    return texts.map((item) => ({ ...item, accepted: Boolean(record[item.key]) }));
  }
  return texts.map((item) => ({ ...item, accepted: false }));
}
