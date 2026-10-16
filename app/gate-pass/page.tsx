import { Suspense } from "react";
import { SiteShell } from "@/components/site-shell";
import { GatePassForm } from "@/components/forms/gate-pass-form";
import { FORM_REFS } from "@/lib/constants";

export default function GatePassPage() {
  return (
    <SiteShell title="Contractor Gate Pass" formRef={FORM_REFS.gate_pass}>
      <Suspense fallback={<p>Loading…</p>}>
        <GatePassForm />
      </Suspense>
    </SiteShell>
  );
}
