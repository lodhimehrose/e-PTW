import Link from "next/link";
import { LayoutDashboard, FileText, QrCode, Settings } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Submissions", icon: FileText },
  { href: "/admin/qr", label: "QR Codes", icon: QrCode },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r bg-white md:block">
      <div className="border-b p-4">
        <p className="font-bold text-sma-navy">SMA Admin</p>
        <p className="text-xs text-muted-foreground">EHS Officer</p>
      </div>
      <nav className="space-y-1 p-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sma-navy hover:bg-sma-section"
          >
            <l.icon className="h-4 w-4 text-sma-gold" />
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
