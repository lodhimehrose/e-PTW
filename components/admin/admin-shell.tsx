"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/admin/login") {
    return <>{children}</>;
  }
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}
