"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { SavedWorker } from "@/app/actions/roster";

export function PeopleOnFile({
  people,
  selectedIds,
  onPick,
}: {
  people: SavedWorker[];
  selectedIds: string[];
  onPick: (person: SavedWorker, checked: boolean) => void;
}) {
  if (!people.length) return null;
  return (
    <div className="space-y-2 rounded-md border border-border bg-card p-3">
      <p className="text-sm font-medium text-foreground">People already added</p>
      <p className="text-xs text-muted-foreground">Tick a person to fill their name, Emirates ID, expiry, mobile, and saved ID copy.</p>
      {people.map((person) => {
        const selected = selectedIds.some((id) => id.replace(/\s/g, "") === person.emiratesId.replace(/\s/g, ""));
        return (
          <label key={person.emiratesId} className={`flex items-start gap-2 text-sm ${person.expired ? "text-red-700" : "text-foreground"}`}>
            <Checkbox
              className="mt-0.5"
              checked={selected && !person.expired}
              disabled={person.expired}
              onCheckedChange={(checked) => onPick(person, checked === true)}
            />
            <span>
              {person.fullName}
              <span className="block text-xs text-muted-foreground">
                {person.trade || "Worker"} · {person.emiratesId}
                {person.mobile ? ` · ${person.mobile}` : ""}
                {person.eidExpiry ? ` · expires ${person.eidExpiry}` : ""}
                {person.eidFileName ? " · ID copy on file" : ""}
              </span>
              {person.expired && <span className="block text-xs text-red-700">This Emirates ID is expired. Upload an updated copy before using this person.</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}
