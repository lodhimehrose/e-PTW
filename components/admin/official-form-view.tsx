import { formFor } from "@/lib/forms";
import { selectedKeys, statementsFrom, type FormField } from "@/lib/forms/shared";
import { FORM_07_UNDERTAKINGS } from "@/lib/forms/form-07";

type Worker = { id?: string; full_name: string; trade: string; emirates_id: string; eid_expiry: string; mobile?: string };
type Vehicle = { id: string; vehicle_type: string | null; plate_no: string | null; driver_name: string | null };
type Tool = { id: string; description: string | null; quantity: string | null; serial_id: string | null };
type GateLog = { id: string; logged_on?: string; direction?: string; note?: string; created_at?: string };

function text(value: unknown) {
  if (value == null || value === "") return "";
  if (Array.isArray(value)) return value.map((item) => (typeof item === "object" ? "" : String(item))).filter(Boolean).join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function Box({ on }: { on: boolean }) {
  return (
    <span className={`mr-1 inline-flex h-3.5 w-3.5 items-center justify-center border text-[10px] font-bold leading-none ${on ? "border-green-600 bg-green-600 text-white" : "border-slate-700 bg-white text-slate-900"}`}>
      {on ? "✓" : ""}
    </span>
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
  vehicles = [],
  tools = [],
  gateLogs = [],
  signatureUrl,
  documents = [],
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
  vehicles?: Vehicle[];
  tools?: Tool[];
  gateLogs?: GateLog[];
  signatureUrl?: string | null;
  documents?: { file_name: string | null; href: string | null }[];
}) {
  const form = formFor(type, data);
  const values: Record<string, unknown> = {
    ...data,
    companyName: companyName || data.companyName,
    building: building || data.building,
    applicantEmail: data.applicantEmail || contactEmail,
    contactEmail,
    startDate: data.startDate || startAt,
    endDate: data.endDate || endAt,
    entryFrom: data.entryFrom || startAt,
    entryTo: data.entryTo || endAt,
    maxWorkers: data.maxWorkers || workers.length,
    workerCount: workers.length,
    permitType: String(data.form || "").includes("08A") || type === "ptw_emergency" ? "Emergency" : "Standard",
  };
  const statements = statementsFrom(data.undertakings, FORM_07_UNDERTAKINGS);

  function fieldValue(field: FormField) {
    return values[field.key];
  }

  return (
    <article className="official-form max-w-full overflow-x-auto text-slate-900" style={{ colorScheme: "light", background: "#fff" }}>
      <div className="official-sheet min-w-0 border border-[#808080] bg-white sm:min-w-[760px]" style={{ background: "#fff" }}>
        <header className="official-head grid grid-cols-1 items-center gap-3 border-b border-[#808080] p-3 sm:grid-cols-[110px_1fr_210px]">
          <img src="/sma-logo.jpg" alt="Sharjah Maritime Academy" className="h-20 w-auto object-contain" />
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-[#13294B]">SHARJAH MARITIME ACADEMY</p>
            <h2 className="text-lg font-bold text-[#13294B]">{form.title}</h2>
          </div>
          <div className="text-left text-[11px] italic text-slate-700 sm:text-right">
            <p>{form.reference}</p>
            <p>For Official Use Only</p>
            <p className="mt-1 not-italic font-bold text-slate-900">{form.numberLabel} {refNo}</p>
            <p className={`not-italic text-sm font-bold capitalize ${status === "rejected" || status === "cancelled" ? "text-red-700" : status === "approved" || status === "approved_with_conditions" || status === "active" ? "text-green-700" : "text-slate-900"}`}>{status.replace(/_/g, " ")}</p>
          </div>
        </header>
        <div className="h-1 bg-[#B8963E]" />
        <div className="bg-[#F5F5F5] px-3 py-2 text-[11px] leading-5 text-slate-700">
          {form.instructions.map((line) => <p key={line}>{line}</p>)}
        </div>

        {form.sections.map((section) => (
          <section key={section.id}>
            <div className="grid grid-cols-[120px_1fr] bg-[#13294B] text-white">
              <p className="px-2 py-1 text-[11px] font-bold">{section.code}</p>
              <p className="px-2 py-1 text-[11px] font-bold">{section.title}</p>
            </div>
        <div className="official-fields" style={{ display: "grid", gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
              {section.fields.map((field) => {
                if (field.type === "table" && (field.key === "workers" || field.key === "supervisor")) {
                  return (
                    <div key={field.key} className="overflow-x-auto" style={{ gridColumn: "1 / -1" }}>
                      <table className="w-full border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-[#F5F5F5] text-left text-slate-700">
                            {["S/N", "Full name", "Designation / Trade", "Emirates ID No.", "EID expiry", "Mobile", "EID copy"].map((heading) => (
                              <th key={heading} className="border border-[#808080] px-1 py-1 font-bold">{heading}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {workers.map((worker, index) => {
                            const file = documents.find((doc) => (doc.file_name || "").toLowerCase().includes(worker.full_name.toLowerCase().slice(0, 8)));
                            return (
                              <tr key={worker.id || worker.emirates_id}>
                                <td className="border border-[#808080] px-1 py-1">{index + 1}</td>
                                <td className="border border-[#808080] px-1 py-1">{worker.full_name}</td>
                                <td className="border border-[#808080] px-1 py-1">{worker.trade}</td>
                                <td className="border border-[#808080] px-1 py-1">{worker.emirates_id}</td>
                                <td className="border border-[#808080] px-1 py-1">{String(worker.eid_expiry).slice(0, 10)}</td>
                                <td className="border border-[#808080] px-1 py-1">{worker.mobile}</td>
                                <td className="border border-[#808080] px-1 py-1">{file?.href ? <a className="underline" href={file.href}>View</a> : "—"}</td>
                              </tr>
                            );
                          })}
                          {!workers.length && <tr><td className="border border-[#808080] px-1 py-1 text-slate-700" colSpan={7}>None listed</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                if (field.type === "table" && field.key === "vehicles") {
                  return <SimpleTable key={field.key} headers={["Vehicle", "Plate", "Driver"]} rows={vehicles.map((item) => [item.vehicle_type || "", item.plate_no || "", item.driver_name || ""])} />;
                }
                if (field.type === "table" && field.key === "tools") {
                  return <SimpleTable key={field.key} headers={["Item", "Qty", "Serial"]} rows={tools.map((item) => [item.description || "", item.quantity || "", item.serial_id || ""])} />;
                }
                if (field.type === "table" && field.key === "gateLog") {
                  return <SimpleTable key={field.key} headers={["When", "Direction", "Note"]} rows={gateLogs.map((item) => [item.logged_on || item.created_at || "", item.direction || "", item.note || ""])} />;
                }
                if (field.type === "checkboxGroup" || field.type === "radio") {
                  const picked = selectedKeys(fieldValue(field), field.options || []);
                  return (
                    <div key={field.key} className="border border-[#808080] p-2" style={{ gridColumn: "1 / -1" }}>
                      <p className="mb-1 text-[11px] font-bold text-slate-700">{field.label}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {(field.options || []).map((option) => (
                          <span key={option.key} className="inline-flex items-center text-[11px] text-slate-900">
                            <Box on={picked.includes(option.key)} /> {option.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (field.type === "statement") {
                  const match = statements.find((item) => item.text === field.label);
                  const accepted = match ? match.accepted : Boolean(values.declarantName);
                  return (
                    <p key={field.key} className="border border-[#808080] px-2 py-1 text-[11px] leading-5 text-slate-900" style={{ gridColumn: "1 / -1" }}>
                      <Box on={accepted} /> {field.label}
                    </p>
                  );
                }
                if (field.type === "signature") {
                  return (
                    <div key={field.key} className="col-span-8 border border-[#808080] p-2">
                      <p className="text-[11px] font-bold text-slate-700">Signature</p>
                      {signatureUrl ? <img src={signatureUrl} alt="Signature" className="mt-1 h-14 object-contain" /> : <p className="text-[11px] text-slate-700">—</p>}
                      <p className="text-[11px] text-slate-900">{text(values.declarantName)}</p>
                      <p className="text-[11px] text-slate-700">{text(values.submittedAt || values.signedDate)}</p>
                    </div>
                  );
                }
                if (field.type === "fileList") {
                  return (
                    <div key={field.key} className="border border-[#808080] p-2 text-[11px] text-slate-900" style={{ gridColumn: "1 / -1" }}>
                      <p className="font-bold text-slate-700">{field.label}</p>
                      {documents.length ? documents.map((doc) => <p key={doc.file_name}>{doc.href ? <a className="underline" href={doc.href}>{doc.file_name}</a> : doc.file_name}</p>) : <p>—</p>}
                    </div>
                  );
                }
                const span = field.span ?? 12;
                return (
                  <div key={field.key} className="border border-[#808080] p-2" style={{ gridColumn: `span ${span} / span ${span}` }}>
                    <p className="text-[10px] font-bold uppercase text-slate-700">{field.label}</p>
                    <p className="whitespace-pre-wrap text-[12px] text-slate-900">{text(fieldValue(field)) || "—"}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {form.hse.length > 0 && (
          <section className="hse-admin-page">
            <div className="grid grid-cols-[120px_1fr] bg-[#13294B] text-white">
              <p className="px-2 py-1 text-[11px] font-bold">SECTION VI</p>
              <p className="px-2 py-1 text-[11px] font-bold">HEALTH, SAFETY AND ENVIRONMENT REQUIREMENTS</p>
            </div>
            <p className="border border-[#808080] bg-[#FFF8E8] px-2 py-1 text-[11px] text-[#13294B]">For the EHS officer. This page is not included when the permit is printed.</p>
            {form.hse.map((block) => (
              <div key={block.id} className="border border-[#808080] p-2">
                <p className="bg-[#DCE6F3] px-2 py-1 text-[11px] font-bold text-[#13294B]">{block.id}) {block.title}</p>
                <ul className="mt-1 space-y-0.5 text-[11px] text-slate-900">
                  {block.items.map((item) => {
                    const picked = selectedKeys(data.hseAccepted ?? data.safetyControls, block.items.map((entry) => ({ key: entry, label: entry })));
                    return <li key={item}><Box on={picked.includes(item)} /> {item}</li>;
                  })}
                </ul>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 border border-[#808080] p-2 text-[11px] font-bold">
              <span className="bg-green-600 px-2 py-1 text-white">GREEN TAG – Safe for use</span>
              <span className="bg-yellow-300 px-2 py-1 text-slate-900">YELLOW TAG – Use with caution</span>
              <span className="bg-red-600 px-2 py-1 text-white">RED TAG – Do not use</span>
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>{headers.map((header) => <th key={header} className="border border-[#808080] bg-[#F5F5F5] px-1 py-1 text-left font-bold text-slate-700">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td className="border border-[#808080] px-1 py-1 text-slate-700" colSpan={headers.length}>None listed</td></tr>}
          {rows.map((row, index) => (
            <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="border border-[#808080] px-1 py-1 text-slate-900">{cell || "—"}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
