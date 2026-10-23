"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./sidebar";
import { AccountSwitcher } from "./account-switcher";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
export function AdminShell({
  children,
  accounts,
}: {
  children: React.ReactNode;
  accounts: { id: string; email: string; name: string }[];
}) {
  const path = usePathname();
  if (path === "/admin/login") {
    return <>{children}</>;
  }
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar accounts={accounts} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="space-y-3 border-b border-border px-4 py-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">SMA Admin</p>
            <ThemeToggle tone="onLight" />
            <SignOutButton redirectTo="/admin/login" />
          </div>
          <AccountSwitcher accounts={accounts} />
        </div>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
