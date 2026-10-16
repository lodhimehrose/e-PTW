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
import type { WorkerInput } from "@/lib/validations/worker";
import { FieldError } from "@/components/field-error";
import { Plus, Trash2 } from "lucide-react";

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
  workEndDate?: string;
  maxWorkers?: number;
  errors?: Record<string, string>;
};

export function WorkersEditor({
  workers,
  onChange,
  workEndDate,
  maxWorkers,
  errors,
}: Props) {
  const update = (index: number, patch: Partial<WorkerInput>) => {
    const next = [...workers];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-6">
      {workers.map((w, i) => (
        <div key={i} className="rounded-md border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-medium text-sma-navy">Worker {i + 1}</p>
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
              <Input value={w.emiratesId} onChange={(e) => update(i, { emiratesId: e.target.value })} />
            </div>
            <div>
              <Label>EID expiry *</Label>
              <Input type="date" value={w.eidExpiry} onChange={(e) => update(i, { eidExpiry: e.target.value })} />
            </div>
            <div>
              <Label>Mobile *</Label>
              <Input value={w.mobile} onChange={(e) => update(i, { mobile: e.target.value })} />
            </div>
          </div>
          <FieldError message={errors?.[`workers.${i}`]} />
        </div>
      ))}
      {!(maxWorkers !== undefined && workers.length >= maxWorkers) && (
        <Button type="button" variant="outline" onClick={() => onChange([...workers, emptyWorker()])}>
          <Plus className="mr-2 h-4 w-4" /> Add worker
        </Button>
      )}
    </div>
  );
}
