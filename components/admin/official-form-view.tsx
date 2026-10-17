import { FORM_REFS } from "@/lib/constants";

type Worker = {
  id?: string;
  full_name: string;
  trade: string;
  emirates_id: string;
  eid_expiry: string;
  mobile?: string;
};

type Vehicle = {
  id: string;
  vehicle_type: string | null;
  plate_no: string | null;
  driver_name: string | null;
};

type Tool = {
  id: string;
  description: string | null;
  quantity: string | null;
  serial_id: string | null;
};

function text(value: unknown) {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function Cell({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="border border-slate-400 p-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{text(value)}</p>
    </div>
  );
}

export function OfficialFormView({
  type,
  refNo,
  status,
  companyName,
  contactEmail,
  building,
  startAt,
  endAt,
  data,
  workers,
  vehicles,
  tools,
  signatureUrl,
}: {
  type: string;
  refNo: string;
  status: string;
  companyName: string;
  contactEmail: string;
  building: string;
  startAt: string | null;
  endAt: string | null;
  data: Record<string, unknown>;
  workers: Worker[];
  vehicles: Vehicle[];
  tools: Tool[];
  signatureUrl?: string | null;
}) {
  const emergency = type === "ptw_emergency";
  const gate = type === "gate_pass";
  const title = gate
    ? data.form === "Form-08A"
      ? "Contractor Emergency Gate Pass"
      : "Contractor Gate Pass"
    : emergency
      ? "Emergency / Breakdown Permit to Work"
      : "Standard Permit to Work";
  const formRef = gate
    ? data.form === "Form-08A"
      ? "EHSQ/SMA/2026/GP/Form-08A Rev.00"
      : FORM_REFS.gate_pass
    : emergency
      ? FORM_REFS.ptw_emergency
      : FORM_REFS.ptw_standard;

  return (
    <article className="overflow-hidden rounded-sm border border-slate-500 bg-white text-slate-900 shadow-md">
      <header className="grid grid-cols-[88px_1fr_180px] items-center gap-3 border-b border-slate-500 p-4">
        <img src="/sma-logo.jpg" alt="Sharjah Maritime Academy" className="h-20 w-20 rounded-full object-cover" />
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#13294B]">SHARJAH MARITIME ACADEMY</p>
          <h2 className="mt-1 text-lg font-bold uppercase text-[#13294B]">{title}</h2>
          <p className="text-[11px] text-slate-600">{formRef}</p>
        </div>
        <div className="text-right text-xs">
          <p className="italic text-slate-500">For official use only</p>
          <p className="mt-1 font-semibold">{gate ? "Gate Pass No." : "Permit No."}</p>
          <p className="text-sm font-bold text-[#13294B]">{refNo}</p>
          <p className="mt-1 capitalize">{status.replace(/_/g, " ")}</p>
        </div>
      </header>
      <div className="h-1 bg-[#B8963E]" />

      <h3 className="bg-[#13294B] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
        {gate ? "Section I — Company information" : emergency ? "Section I — Emergency details" : "Section I — Applicant information"}
      </h3>
      <div className="grid sm:grid-cols-2">
        <Cell label="Company name" value={companyName} />
        <Cell label="Trade license no." value={data.tradeLicenseNo} />
        <Cell label={emergency ? "Reported by" : "Applicant"} value={data.applicantName || data.reportedBy} />
        <Cell label="Designation" value={data.designation} />
        <Cell label="Email" value={contactEmail} />
        <Cell label="Contact no." value={data.applicantPhone} />
        <Cell label="Site supervisor" value={data.supervisorName} />
        <Cell label="Supervisor contact" value={data.supervisorPhone} />
        <Cell label="SMA requesting department" value={data.department} />
        <Cell label="Building / location" value={building || data.floorArea} />
      </div>

      <h3 className="bg-[#13294B] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
        {gate ? "Purpose and entry" : emergency ? "Section II — Work scope" : "Section II — Work application"}
      </h3>
      <div className="grid sm:grid-cols-2">
        <Cell label="From" value={startAt} />
        <Cell label="To" value={endAt} />
        <Cell label={emergency ? "Work to be done" : "Scope of work"} value={data.workDescription || data.workScope || data.purpose} />
        <Cell label="PPE" value={data.ppe} />
        {emergency && <Cell label="Immediate risk" value={data.risks} />}
        {emergency && <Cell label="Safety controls" value={data.safetyControls} />}
        {gate && <Cell label="Linked permit" value={data.sourcePermit} />}
      </div>

      <h3 className="bg-[#13294B] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
        {gate ? "Section II — Workforce" : "Section III — Workforce details"}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-slate-100 text-left">
            <tr>
              {["S/N", "Full name", "Trade", "Emirates ID", "EID expiry", "Mobile"].map((heading) => (
                <th key={heading} className="border border-slate-400 px-2 py-1">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 && (
              <tr>
                <td colSpan={6} className="border border-slate-400 px-2 py-2 text-slate-500">No workers listed</td>
              </tr>
            )}
            {workers.map((worker, index) => (
              <tr key={worker.id || worker.emirates_id}>
                <td className="border border-slate-400 px-2 py-1">{index + 1}</td>
                <td className="border border-slate-400 px-2 py-1">{worker.full_name}</td>
                <td className="border border-slate-400 px-2 py-1">{worker.trade}</td>
                <td className="border border-slate-400 px-2 py-1">{worker.emirates_id}</td>
                <td className="border border-slate-400 px-2 py-1">{String(worker.eid_expiry).slice(0, 10)}</td>
                <td className="border border-slate-400 px-2 py-1">{worker.mobile || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(vehicles.length > 0 || tools.length > 0) && (
        <>
          <h3 className="bg-[#13294B] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Vehicles, tools and materials
          </h3>
          <div className="grid sm:grid-cols-2">
            {vehicles.map((vehicle) => (
              <Cell key={vehicle.id} label="Vehicle" value={`${vehicle.vehicle_type || "Vehicle"} · ${vehicle.plate_no || "no plate"} · ${vehicle.driver_name || ""}`} />
            ))}
            {tools.map((tool) => (
              <Cell key={tool.id} label="Tool" value={`${tool.description || "Item"} · qty ${tool.quantity || "—"} · ${tool.serial_id || ""}`} />
            ))}
          </div>
        </>
      )}

      <h3 className="bg-[#13294B] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
        Declaration
      </h3>
      <div className="grid gap-2 p-3 text-sm sm:grid-cols-[1fr_160px]">
        <p>
          I confirm that the information on this {gate ? "gate pass" : "permit"} is true, that listed workers hold a valid Emirates ID, and that the work will follow the SMA permit conditions.
        </p>
        {signatureUrl ? (
          <img src={signatureUrl} alt="Signature" className="h-16 w-40 border border-slate-300 object-contain" />
        ) : (
          <p className="text-xs text-slate-500">Signature on file</p>
        )}
      </div>
    </article>
  );
}
