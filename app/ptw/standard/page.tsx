import { SiteShell } from "@/components/site-shell";
import { PtwStandardForm } from "@/components/forms/ptw-standard-form";
import { FORM_REFS } from "@/lib/constants";

export default function PtwStandardPage() {
  return (
    <SiteShell title="Standard Permit to Work" formRef={FORM_REFS.ptw_standard}>
      <PtwStandardForm />
    </SiteShell>
  );
}
