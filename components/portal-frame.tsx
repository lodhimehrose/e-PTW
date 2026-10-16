import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteShell } from "@/components/site-shell";
import type { PortalUser } from "@/lib/portal";

const links = [
  { href: "/portal", label: "Submissions" },
  { href: "/portal/profile", label: "Profile" },
];

export function PortalFrame({
  user,
  title,
  children,
}: {
  user: PortalUser;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <SiteShell title={title}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-foreground">{user.name}</p>
          <p className="text-sm text-muted-foreground">
            {user.company ? `${user.company} · ` : ""}
            {user.email}
          </p>
        </div>
        <SignOutButton redirectTo="/portal/login" />
      </div>
      <nav className="mb-6 flex gap-2 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-border bg-card px-4 py-2 font-medium text-foreground hover:bg-muted"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {children}
    </SiteShell>
  );
}
