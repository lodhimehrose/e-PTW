import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, FileText, Search, QrCode, Settings } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccountSwitcher } from "./account-switcher";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Submissions", icon: FileText },
  { href: "/admin/status", label: "Track status", icon: Search },
  { href: "/admin/qr", label: "QR Codes", icon: QrCode },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({
  accounts,
}: {
  accounts: { id: string; email: string; name: string }[];
}) {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex items-center gap-3 border-b p-4">
        <Image src="/sma-logo.jpg" alt="SMA" width={40} height={40} className="h-10 w-10 rounded-full object-cover ring-2 ring-sma-gold" />
        <div>
          <p className="font-bold text-foreground">SMA Admin</p>
          <p className="text-xs text-muted-foreground">EHS Officer</p>
        </div>
      </div>
      <AccountSwitcher accounts={accounts} />
      <div className="px-3 pt-3">
        <ThemeToggle tone="onLight" />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            <l.icon className="h-4 w-4 text-sma-gold" />
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 pb-4">
        <SignOutButton redirectTo="/admin/login" />
      </div>
    </aside>
  );
}
