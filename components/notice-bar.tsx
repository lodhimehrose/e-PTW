"use client";

import { useEffect, useState } from "react";

type Notice = { message: string; tone: "ok" | "error" };

export function notify(message: string, tone: Notice["tone"] = "ok") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("sma-notice", { detail: { message, tone } }));
}

export function NoticeBar() {
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let timer = 0;
    function show(next: Notice) {
      setNotice(next);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setNotice(null), 4500);
    }
    function onNotice(event: Event) {
      const detail = (event as CustomEvent<Notice>).detail;
      if (detail?.message) show(detail);
    }
    window.addEventListener("sma-notice", onNotice);
    return () => {
      window.removeEventListener("sma-notice", onNotice);
      window.clearTimeout(timer);
    };
  }, []);

  if (!notice) return null;
  return (
    <div
      role="status"
      className={`fixed inset-x-0 top-0 z-[100] px-4 py-3 text-center text-sm font-semibold text-white shadow-lg ${notice.tone === "error" ? "bg-red-600" : "bg-green-600"}`}
    >
      {notice.message}
    </div>
  );
}
