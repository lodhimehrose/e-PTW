"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRADE_DESIGNATIONS } from "@/lib/constants";
import { formatEmiratesId, type WorkerInput } from "@/lib/validations/worker";
import { FieldError } from "@/components/field-error";
import { FileUploadField } from "@/components/file-upload-field";
import { Plus, Trash2 } from "lucide-react";
import type { SavedWorker } from "@/app/actions/roster";

const emptyWorker = (): WorkerInput => ({
  fullName: "",
  trade: "",
  emiratesId: "",
  eidExpiry: "",
  mobile: "",
  inductionDone: "no",
});

type Props = {
  workers: WorkerInput[];
  onChange: (workers: WorkerInput[]) => void;
  errors?: Record<string, string>;
  savedWorkers?: SavedWorker[];
  workEndDate?: string;
  maxWorkers?: number;
};

export function WorkersEditor({ workers, onChange, errors, savedWorkers = [] }: Props) {
  const update = (index: number, patch: Partial<WorkerInput>) => {
    const next = [...workers];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-6">
      {savedWorkers.length > 0 && (
        <div className="space-y-2 rounded-md border border-border p-4">
          <p className="font-medium text-foreground">Tick the workers attending this job</p>
          {savedWorkers.filter((worker) => !worker.expired).map((worker) => {
            const selected = workers.some((item) => item.emiratesId === worker.emiratesId);
            return (
              <label key={worker.emiratesId} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selected}
                  onChange={(event) => {
                    if (event.target.checked) {
                      if (selected) return;
                      const blankOnly = workers.length === 1 && !workers[0].fullName && !workers[0].emiratesId;
                      onChange([
                        ...(blankOnly ? [] : workers),
                        {
                          fullName: worker.fullName,
                          trade: worker.trade,
                          emiratesId: worker.emiratesId,
                          eidExpiry: worker.eidExpiry,
                          mobile: worker.mobile.replace(/\D/g, "").slice(0, 10),
                          inductionDone: "no",
                        },
                      ]);
                    } else {
                      onChange(workers.filter((item) => item.emiratesId !== worker.emiratesId));
                    }
                  }}
                />
                <span>
                  {worker.fullName}
                  <span className="block text-xs text-muted-foreground">{worker.trade} · {worker.emiratesId}</span>
                </span>
              </label>
            );
          })}
          {savedWorkers.filter((worker) => worker.expired).map((worker) => (
            <p key={worker.emiratesId} className="text-sm text-red-600">
              {worker.fullName}: Emirates ID is expired. Provide an updated ID. This person is not included on the permit.
            </p>
          ))}
        </div>
      )}
      {errors?.workers && <FieldError message={errors.workers} />}
      {workers.map((w, i) => {
        if (savedWorkers.some((saved) => saved.emiratesId === w.emiratesId)) return null;
        return (
        <div key={i} className="rounded-md border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-medium text-foreground">Worker {i + 1}</p>
            {workers.length > 1 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(workers.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Full name *</Label>
              <Input value={w.fullName} onChange={(e) => update(i, { fullName: e.target.value })} />
            </div>
            <div>
              <Label>Trade *</Label>
              <Select value={w.trade} onValueChange={(v) => update(i, { trade: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {TRADE_DESIGNATIONS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Emirates ID *</Label>
              <Input
                value={w.emiratesId}
                placeholder="784-XXXXXXXXXXX-X"
                onChange={(e) => update(i, { emiratesId: formatEmiratesId(e.target.value) })}
              />
            </div>
            <div>
              <Label>EID expiry *</Label>
              <Input type="date" value={w.eidExpiry} onChange={(e) => update(i, { eidExpiry: e.target.value })} />
            </div>
            <div>
              <Label>Mobile *</Label>
              <Input
                value={w.mobile}
                inputMode="numeric"
                maxLength={10}
                placeholder="05XXXXXXXX"
                onChange={(e) => update(i, { mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              />
            </div>
            <div className="md:col-span-2">
              <FileUploadField
                label="Emirates ID copy"
                files={w.eidCopy ? [w.eidCopy] : []}
                onChange={(files) => update(i, { eidCopy: files[0] })}
              />
            </div>
          </div>
          <FieldError message={errors?.[`workers.${i}`]} />
        </div>
        );
      })}
      <Button type="button" variant="outline" onClick={() => onChange([...workers, emptyWorker()])}>
        <Plus className="mr-2 h-4 w-4" /> Add worker
      </Button>
    </div>
  );
}
