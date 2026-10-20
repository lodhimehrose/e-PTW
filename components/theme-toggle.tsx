"use client";

import { useEffect, useState } from "react";

export type ThemeName = "light" | "dark" | "midnight";

const OPTIONS: { id: ThemeName; label: string }[] = [
  { id: "light", label: "Cream" },
  { id: "dark", label: "Dark" },
  { id: "midnight", label: "Midnight" },
];

export function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark" || theme === "midnight");
  root.classList.toggle("midnight", theme === "midnight");
  localStorage.setItem("sma-theme", theme);
}

export function ThemeToggle({ tone = "onDark" }: { tone?: "onDark" | "onLight" }) {
  const [theme, setTheme] = useState<ThemeName>("light");

  useEffect(() => {
    const saved = localStorage.getItem("sma-theme");
    if (saved === "dark" || saved === "midnight" || saved === "light") setTheme(saved);
    else if (document.documentElement.classList.contains("midnight")) setTheme("midnight");
    else if (document.documentElement.classList.contains("dark")) setTheme("dark");
  }, []);

  function choose(next: ThemeName) {
    applyTheme(next);
    setTheme(next);
  }

  const shell = tone === "onDark" ? "border-white/25 bg-white/10" : "border-border bg-card";

  return (
    <div className={`inline-flex rounded-full border p-0.5 text-[11px] font-semibold ${shell}`} role="tablist" aria-label="Theme">
      {OPTIONS.map((option) => {
        const active = theme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => choose(option.id)}
            className={`rounded-full px-2.5 py-1 ${active ? "bg-[#B8963E] text-[#13294B]" : tone === "onDark" ? "text-white" : "text-foreground"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
