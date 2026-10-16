import { SiteShell } from "@/components/site-shell";
import { PtwEmergencyForm } from "@/components/forms/ptw-emergency-form";
import { FORM_REFS } from "@/lib/constants";

export default function PtwEmergencyPage() {
  return (
    <SiteShell title="Emergency / Breakdown PTW" formRef={FORM_REFS.ptw_emergency}>
      <PtwEmergencyForm />
    </SiteShell>
  );
}
