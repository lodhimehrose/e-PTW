import Link from "next/link";
import { exitContractorAccount } from "@/app/actions/accounts";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteShell } from "@/components/site-shell";
import type { PortalUser } from "@/lib/portal";

const links = [
  { href: "/portal", label: "Submissions" },
  { href: "/portal/status", label: "Track status" },
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
      {user.viewingAsAdmin && (
        <form action={exitContractorAccount} className="mb-4 rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">
          <p>You are viewing this contractor account as the EHS officer. They cannot open other accounts.</p>
          <button type="submit" className="mt-2 font-semibold underline-offset-4 hover:underline">
            Return to admin
          </button>
        </form>
      )}
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
