import { createServiceClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const supabase = createServiceClient();
  const { data: s } = await supabase.from("settings").select("*").limit(1).single();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-sma-navy">Settings</h1>
      <SettingsForm
        initial={{
          gatePassRecipients: s?.gate_pass_recipients ?? "",
          ptwStandardRecipients: s?.ptw_standard_recipients ?? "",
          ptwEmergencyRecipients: s?.ptw_emergency_recipients ?? "",
          adminName: s?.admin_name ?? "EHS Officer",
          maxPermitDays: s?.max_permit_days ?? 7,
          emergencyMaxHours: s?.emergency_max_hours ?? 12,
          buildings: Array.isArray(s?.buildings)
            ? (s.buildings as string[]).join("\n")
            : "",
        }}
      />
    </div>
  );
}
