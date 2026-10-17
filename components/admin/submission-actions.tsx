"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  decideSubmission,
  updateSubmissionStatus,
  addRevalidation,
  addGateLog,
} from "@/app/actions/admin";

export function SubmissionActions({
  id,
  type,
}: {
  id: string;
  type: string;
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function decide(decision: "approved" | "approved_with_conditions" | "rejected") {
    setLoading(true);
    const res = await decideSubmission(id, decision, note);
    setLoading(false);
    setMsg(res.ok ? "Decision saved." : res.error ?? "Error");
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <h3 className="font-semibold text-foreground">Approve or reject</h3>
      <Textarea
        placeholder="Conditions or rejection reason"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button disabled={loading} onClick={() => decide("approved")}>
          Approve
        </Button>
        <Button
          variant="secondary"
          disabled={loading}
          onClick={() => decide("approved_with_conditions")}
        >
          Approve with conditions
        </Button>
        <Button
          variant="destructive"
          disabled={loading}
          onClick={() => decide("rejected")}
        >
          Reject
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 border-t pt-4">
        {["active", "suspended", "closed", "cancelled"].map((s) => (
          <Button
            key={s}
            variant="outline"
            size="sm"
            onClick={async () => {
              await updateSubmissionStatus(id, s, note);
              setMsg(`Status: ${s}`);
            }}
          >
            {s}
          </Button>
        ))}
      </div>
      {type === "ptw_standard" && (
        <RevalidationForm id={id} onDone={() => setMsg("Revalidated")} />
      )}
      {type === "gate_pass" && (
        <GateLogForm id={id} onDone={() => setMsg("Gate log saved")} />
      )}
      {msg && <p className="text-sm text-green-700">{msg}</p>}
    </div>
  );
}

function RevalidationForm({
  id,
  onDone,
}: {
  id: string;
  onDone: () => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [workers, setWorkers] = useState("1");
  const [remarks, setRemarks] = useState("");
  return (
    <div className="space-y-2 border-t pt-4">
      <p className="text-sm font-medium">Daily revalidation</p>
      <input type="date" className="border rounded px-2" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="number" className="border rounded px-2 w-24" value={workers} onChange={(e) => setWorkers(e.target.value)} />
      <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Remarks" />
      <Button
        size="sm"
        onClick={async () => {
          await addRevalidation(id, date, parseInt(workers, 10), remarks);
          onDone();
        }}
      >
        Revalidate
      </Button>
    </div>
  );
}

function GateLogForm({ id, onDone }: { id: string; onDone: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeIn, setTimeIn] = useState("08:00");
  const [workersIn, setWorkersIn] = useState("1");
  const [guard, setGuard] = useState("");
  return (
    <div className="space-y-2 border-t pt-4">
      <p className="text-sm font-medium">Gate log</p>
      <input type="date" className="border rounded px-2" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="time" className="border rounded px-2" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} />
      <input type="number" className="border rounded px-2 w-24" value={workersIn} onChange={(e) => setWorkersIn(e.target.value)} />
      <input className="border rounded px-2 w-full" placeholder="Guard name" value={guard} onChange={(e) => setGuard(e.target.value)} />
      <Button
        size="sm"
        onClick={async () => {
          await addGateLog(id, {
            date,
            timeIn,
            workersIn: parseInt(workersIn, 10),
            guardName: guard,
          });
          onDone();
        }}
      >
        Add gate entry
      </Button>
    </div>
  );
}
