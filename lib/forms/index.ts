import { form07 } from "./form-07";
import { form07a } from "./form-07a";
import { form08, form08a } from "./form-08";
import type { FormDefinition } from "./shared";

export function formFor(type: string, data: Record<string, unknown> = {}): FormDefinition {
  if (type === "ptw_emergency") return form07a;
  if (type === "gate_pass") {
    const marker = String(data.form || "");
    return marker === "Form-08A" || marker === "form-08a" ? form08a : form08;
  }
  return form07;
}

export { form07, form07a, form08, form08a };
