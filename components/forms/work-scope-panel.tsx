"use client";

import type { ReactNode } from "react";
import { CRITICAL_WORK_OPTIONS, LIGHT_WORK_OPTIONS } from "@/lib/forms/form-07";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";

export const NORMAL_ACTIVITY = "Light Works";
export const CRITICAL_ACTIVITY = "Critical Works";

export function toggleItem(list: string[] | undefined, item: string) {
  const current = list ?? [];
  return current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item];
}

function Choice({
  checked,
  label,
  hint,
  tone,
  onChange,
}: {
  checked: boolean;
  label: string;
  hint: string;
  tone: "gold" | "red";
  onChange: (checked: boolean) => void;
}) {
  const on = tone === "red";
  return (
    <label
      className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border-2 p-3 ${checked && on ? "border-red-700" : checked ? "border-[#B8963E]" : "border-slate-200"}`}
      style={{ background: checked && on ? "#FEF2F2" : checked ? "#FFF8E8" : "#fff", color: "#13294B" }}
    >
      <Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} className="mt-0.5 h-5 w-5" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-slate-600">{hint}</span>
      </span>
    </label>
  );
}

function Checks({ items, selected, onToggle }: { items: string[]; selected: string[]; onToggle: (item: string) => void }) {
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <label key={item} className="flex min-h-11 items-start gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm" style={{ background: "#fff", color: "#13294B" }}>
          <Checkbox checked={selected.includes(item)} onCheckedChange={() => onToggle(item)} className="mt-0.5" />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
}

export function WorkScopePanel({
  scope,
  onScope,
  activities,
  lightWorks,
  criticalWorks,
  onToggleActivity,
  onToggleLight,
  onToggleCritical,
  fromDate,
  fromTime,
  toDate,
  toTime,
  onFromDate,
  onFromTime,
  onToDate,
  onToTime,
  scopeError,
  timeError,
  activityError,
  notice,
}: {
  scope: string;
  onScope: (value: string) => void;
  activities: string[];
  lightWorks: string[];
  criticalWorks: string[];
  onToggleActivity: (item: string) => void;
  onToggleLight: (item: string) => void;
  onToggleCritical: (item: string) => void;
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  onFromDate: (value: string) => void;
  onFromTime: (value: string) => void;
  onToDate: (value: string) => void;
  onToTime: (value: string) => void;
  scopeError?: string;
  timeError?: string;
  activityError?: string;
  notice?: ReactNode;
}) {
  const normal = activities.includes(NORMAL_ACTIVITY);
  const critical = activities.includes(CRITICAL_ACTIVITY);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.9fr)]">
      <section className="rounded-xl border border-[#E4D3A1] p-4" style={{ background: "#FFF8E8", borderLeftWidth: 8, borderLeftColor: "#B8963E" }}>
        <h2 className="text-xl font-bold text-[#13294B]">Scope</h2>
        <p className="mb-3 text-sm text-slate-600">Describe the work in full. EHSQ reads this on the permit.</p>
        <Textarea
          value={scope}
          onChange={(event) => onScope(event.target.value)}
          placeholder="Nature and scope of the work"
          className="min-h-[220px] text-base md:min-h-[280px]"
          style={{ background: "#fff", color: "#13294B" }}
        />
        <FieldError message={scopeError} />
      </section>

      <div className="space-y-4">
        <section className="rounded-xl border border-slate-200 p-4" style={{ background: "#fff", color: "#13294B" }}>
          <h2 className="text-base font-bold">For EHSQ</h2>
          <p className="mb-3 text-xs text-slate-600">Tick normal activity, critical work, or both. These boxes stay visible on the official form.</p>
          <div className="space-y-2">
            <Choice checked={normal} tone="gold" label="Normal activity" hint="Light, routine, or minor work" onChange={() => onToggleActivity(NORMAL_ACTIVITY)} />
            {normal && <Checks items={LIGHT_WORK_OPTIONS} selected={lightWorks} onToggle={onToggleLight} />}
            <Choice checked={critical} tone="red" label="Critical work" hint="Hot work, height, confined space, isolation, crane" onChange={() => onToggleActivity(CRITICAL_ACTIVITY)} />
            {critical && <Checks items={CRITICAL_WORK_OPTIONS} selected={criticalWorks} onToggle={onToggleCritical} />}
          </div>
          <FieldError message={activityError} />
        </section>

        <section className="rounded-xl border border-slate-200 p-4" style={{ background: "#fff", color: "#13294B" }}>
          <h2 className="text-base font-bold">Time</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            <div>
              <Label htmlFor="scope-from-date">Date from</Label>
              <Input id="scope-from-date" type="date" value={fromDate} onChange={(event) => onFromDate(event.target.value)} className="mt-1" style={{ background: "#fff", color: "#13294B" }} />
            </div>
            <div>
              <Label htmlFor="scope-from-time">Time from</Label>
              <Input id="scope-from-time" type="time" value={fromTime} onChange={(event) => onFromTime(event.target.value)} className="mt-1" style={{ background: "#fff", color: "#13294B" }} />
            </div>
            <div>
              <Label htmlFor="scope-to-date">Date to</Label>
              <Input id="scope-to-date" type="date" value={toDate} onChange={(event) => onToDate(event.target.value)} className="mt-1" style={{ background: "#fff", color: "#13294B" }} />
            </div>
            <div>
              <Label htmlFor="scope-to-time">Time to</Label>
              <Input id="scope-to-time" type="time" value={toTime} onChange={(event) => onToTime(event.target.value)} className="mt-1" style={{ background: "#fff", color: "#13294B" }} />
            </div>
          </div>
          {notice}
          <FieldError message={timeError} />
        </section>
      </div>
    </div>
  );
}
