"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ tone = "onDark" }: { tone?: "onDark" | "onLight" }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("sma-theme", next ? "dark" : "light");
    setDark(next);
  }

  const styles =
    tone === "onDark"
      ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
      : "border-border bg-card text-foreground hover:bg-muted";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to cream theme" : "Switch to dark theme"}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium ${styles}`}
    >
      {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      {dark ? "Cream" : "Dark"}
    </button>
  );
}
