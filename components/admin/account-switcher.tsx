"use client";

import { useState } from "react";
import { openContractorAccount } from "@/app/actions/accounts";

export function AccountSwitcher({
  accounts,
}: {
  accounts: { id: string; email: string; name: string }[];
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onChange(id: string) {
    if (!id) return;
    setPending(true);
    setError("");
    const result = await openContractorAccount(id);
    if (result && !result.ok) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="px-3 pt-3">
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Contractor accounts
      </label>
      <select
        defaultValue=""
        disabled={pending || accounts.length === 0}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-2 py-2 text-xs text-foreground"
      >
        <option value="">
          {accounts.length ? "Open an account…" : "No accounts yet"}
        </option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name} · {account.email}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
