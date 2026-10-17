"use client";

import { useEffect, useState } from "react";
import { searchCompanies, type CompanyMatch } from "@/app/actions/roster";

export function CompanyPicker({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (company: CompanyMatch) => void;
}) {
  const [companies, setCompanies] = useState<CompanyMatch[]>([]);

  useEffect(() => {
    const name = query.trim();
    if (name.length < 2) {
      setCompanies([]);
      return;
    }
    const timer = setTimeout(() => {
      searchCompanies(name).then((result) => setCompanies(result.companies));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  if (!companies.length) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Saved companies
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {companies.map((company) => (
          <button
            key={company.companyName}
            type="button"
            onClick={() => onSelect(company)}
            className="rounded-full border border-border bg-background px-4 py-2 text-left text-sm hover:border-sma-gold"
          >
            <span className="font-medium text-foreground">{company.companyName}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {company.workers.length} worker{company.workers.length === 1 ? "" : "s"} saved
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
