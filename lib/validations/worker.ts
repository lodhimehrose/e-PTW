import { z } from "zod";
import { EID_REGEX, MOBILE_REGEX } from "@/lib/constants";

export const workerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  trade: z.string().min(1, "Designation is required"),
  tradeOther: z.string().optional(),
  emiratesId: z
    .string()
    .regex(EID_REGEX, "Use format 784-XXXX-XXXXXXX-X"),
  eidExpiry: z.string().min(1, "EID expiry is required"),
  mobile: z.string().regex(MOBILE_REGEX, "Use 05XXXXXXXX or +9715XXXXXXXX"),
  inductionDone: z.enum(["yes", "no"]).optional(),
});

export type WorkerInput = z.infer<typeof workerSchema>;

export function validateWorkersEidUnique(workers: WorkerInput[]) {
  const ids = workers.map((w) => w.emiratesId);
  return new Set(ids).size === ids.length;
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
