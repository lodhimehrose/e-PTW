"use client";

import { useState } from "react";
import { saveSettings } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Initial = {
  gatePassRecipients: string;
  ptwStandardRecipients: string;
  ptwEmergencyRecipients: string;
  adminName: string;
  maxPermitDays: number;
  emergencyMaxHours: number;
  buildings: string;
};

export function SettingsForm({ initial }: { initial: Initial }) {
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState("");

  return (
    <form
      className="space-y-4 rounded-lg border bg-white p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        await saveSettings(form);
        setMsg("Settings saved.");
      }}
    >
      <div>
        <Label>Admin name (on PDFs)</Label>
        <Input
          value={form.adminName}
          onChange={(e) => setForm({ ...form, adminName: e.target.value })}
        />
      </div>
      <div>
        <Label>Gate pass notification emails (comma-separated)</Label>
        <Input
          value={form.gatePassRecipients}
          onChange={(e) =>
            setForm({ ...form, gatePassRecipients: e.target.value })
          }
        />
      </div>
      <div>
        <Label>Standard PTW notification emails</Label>
        <Input
          value={form.ptwStandardRecipients}
          onChange={(e) =>
            setForm({ ...form, ptwStandardRecipients: e.target.value })
          }
        />
      </div>
      <div>
        <Label>Emergency PTW notification emails</Label>
        <Input
          value={form.ptwEmergencyRecipients}
          onChange={(e) =>
            setForm({ ...form, ptwEmergencyRecipients: e.target.value })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Max permit days</Label>
          <Input
            type="number"
            value={form.maxPermitDays}
            onChange={(e) =>
              setForm({ ...form, maxPermitDays: parseInt(e.target.value, 10) })
            }
          />
        </div>
        <div>
          <Label>Emergency max hours</Label>
          <Input
            type="number"
            value={form.emergencyMaxHours}
            onChange={(e) =>
              setForm({
                ...form,
                emergencyMaxHours: parseInt(e.target.value, 10),
              })
            }
          />
        </div>
      </div>
      <div>
        <Label>Buildings (one per line)</Label>
        <Textarea
          rows={6}
          value={form.buildings}
          onChange={(e) => setForm({ ...form, buildings: e.target.value })}
        />
      </div>
      <Button type="submit">Save settings</Button>
      {msg && <p className="text-sm text-green-700">{msg}</p>}
    </form>
  );
}
