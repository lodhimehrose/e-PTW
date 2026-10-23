"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveWorkClassification } from "@/app/actions/admin";
import { CRITICAL_ACTIVITY, NORMAL_ACTIVITY, toggleItem } from "@/components/forms/work-scope-panel";
import { CRITICAL_WORK_OPTIONS, LIGHT_WORK_OPTIONS } from "@/lib/forms/form-07";
import { SAFETY_CONTROLS } from "@/lib/safety-controls";
import { notify } from "@/components/notice-bar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

function asList(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value) return [value];
  return [];
}

export function EhsqClassification({
  id,
  workType,
  lightWorks,
  criticalWorks,
  safetyControls,
  safetyOther,
  criticalOther,
  showSafety,
}: {
  id: string;
  workType: unknown;
  lightWorks: unknown;
  criticalWorks: unknown;
  safetyControls?: unknown;
  safetyOther?: unknown;
  criticalOther?: unknown;
  showSafety?: boolean;
}) {
  const router = useRouter();
  const [activities, setActivities] = useState(asList(workType));
  const [light, setLight] = useState(asList(lightWorks));
  const [critical, setCritical] = useState(asList(criticalWorks));
  const [safety, setSafety] = useState(asList(safetyControls));
  const [safetyNote, setSafetyNote] = useState(String(safetyOther || ""));
  const [criticalNote, setCriticalNote] = useState(String(criticalOther || ""));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const result = await saveWorkClassification(id, {
      workType: activities,
      lightWorks: activities.includes(NORMAL_ACTIVITY) ? light : [],
      criticalWorks: activities.includes(CRITICAL_ACTIVITY) ? critical : [],
      safetyControls: safety,
      safetyOther: safety.includes("Others") ? safetyNote : "",
      criticalOther: critical.includes("Others") ? criticalNote : "",
    });
    setSaving(false);
    setMessage(result.ok ? "Classification saved on the permit." : result.error);
    notify(result.ok ? "Classification saved" : result.error || "Could not save the classification", result.ok ? "ok" : "error");
    if (result.ok) router.refresh();
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h3 className="font-semibold text-foreground">EHSQ classification</h3>
      <p className="mb-3 text-sm text-muted-foreground">Tick normal activity, critical work, or both. The official form shows the same boxes.</p>
      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            <Checkbox checked={activities.includes(NORMAL_ACTIVITY)} onCheckedChange={() => setActivities((current) => toggleItem(current, NORMAL_ACTIVITY))} />
            Normal activity
          </label>
          {activities.includes(NORMAL_ACTIVITY) && (
            <div className="mt-2 grid gap-2">
              {LIGHT_WORK_OPTIONS.map((item) => (
                <label key={item} className="flex items-start gap-2 text-sm">
                  <Checkbox checked={light.includes(item)} onCheckedChange={() => setLight((current) => toggleItem(current, item))} className="mt-0.5" />
                  {item}
                </label>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            <Checkbox checked={activities.includes(CRITICAL_ACTIVITY)} onCheckedChange={() => setActivities((current) => toggleItem(current, CRITICAL_ACTIVITY))} />
            Critical work
          </label>
          {activities.includes(CRITICAL_ACTIVITY) && (
            <div className="mt-2 grid gap-2">
              {CRITICAL_WORK_OPTIONS.map((item) => (
                <label key={item} className="flex items-start gap-2 text-sm">
                  <Checkbox checked={critical.includes(item)} onCheckedChange={() => setCritical((current) => toggleItem(current, item))} className="mt-0.5" />
                  {item}
                </label>
              ))}
              {critical.includes("Others") && <Input value={criticalNote} onChange={(event) => setCriticalNote(event.target.value)} placeholder="Describe the other critical work" />}
            </div>
          )}
        </div>
      </div>
      {showSafety && (
        <div className="mt-4">
          <h4 className="font-medium text-foreground">Safety requirements</h4>
          <p className="mb-2 text-sm text-muted-foreground">Set by EHSQ. Contractors do not fill this section.</p>
          <div className="grid gap-2">
            {SAFETY_CONTROLS.map((item) => (
              <label key={item} className="flex items-start gap-2 text-sm">
                <Checkbox checked={safety.includes(item)} onCheckedChange={() => setSafety((current) => toggleItem(current, item))} className="mt-0.5" />
                {item}
              </label>
            ))}
            {safety.includes("Others") && <Input value={safetyNote} onChange={(event) => setSafetyNote(event.target.value)} placeholder="Describe the other safety requirement" />}
          </div>
        </div>
      )}
      <Button type="button" className="mt-4" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save classification"}</Button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </section>
  );
}
