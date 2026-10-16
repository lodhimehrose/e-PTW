"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./sidebar";
import { SignOutButton } from "@/components/sign-out-button";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/admin/login") {
    return <>{children}</>;
  }
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <p className="text-sm font-semibold text-foreground">SMA Admin</p>
          <SignOutButton redirectTo="/admin/login" />
        </div>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
