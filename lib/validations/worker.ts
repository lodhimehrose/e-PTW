import { z } from "zod";
import { EID_REGEX, MOBILE_REGEX } from "@/lib/constants";

export const workerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  trade: z.string().min(1, "Designation is required"),
  tradeOther: z.string().optional(),
  emiratesId: z
    .string()
    .regex(EID_REGEX, "Use format 784-XXXXXXXXXXX-X"),
  eidExpiry: z.string().min(1, "EID expiry is required"),
  mobile: z.string().regex(MOBILE_REGEX, "Mobile must be 10 digits, starting with 05"),
  inductionDone: z.enum(["yes", "no"]).optional(),
  eidCopy: z
    .object({ name: z.string(), type: z.string(), base64: z.string() })
    .optional(),
});

export type WorkerInput = z.infer<typeof workerSchema>;

export function validateWorkersEidUnique(workers: WorkerInput[]) {
  const ids = workers.map((w) => w.emiratesId);
  return new Set(ids).size === ids.length;
}

export function formatEmiratesId(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 15);
  if (!digits) return "";
  const head = digits.slice(0, 3);
  const middle = digits.slice(3, 14);
  const check = digits.slice(14, 15);
  if (digits.length <= 3) return head;
  if (!check) return `${head}-${middle}`;
  return `${head}-${middle}-${check}`;
}

export function workerFieldError(worker: WorkerInput) {
  const parsed = workerSchema.safeParse({
    ...worker,
    emiratesId: formatEmiratesId(worker.emiratesId || ""),
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Complete this worker";
  }
  if (worker.eidExpiry && worker.eidExpiry < new Date().toISOString().slice(0, 10)) {
    return "This person's Emirates ID is expired";
  }
  return "";
}

export function validateEidAfterWorkEnd(
  workers: WorkerInput[],
  workEndDate: string,
) {
  const end = new Date(workEndDate);
  for (const w of workers) {
    const exp = new Date(w.eidExpiry);
    if (exp < end) {
      return false;
    }
  }
  return true;
}
