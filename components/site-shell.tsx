import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteShell({
  children,
  title,
  formRef,
}: {
  children: React.ReactNode;
  title?: string;
  formRef?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-sma-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src="/sma-logo.jpg"
              alt="Sharjah Maritime Academy"
              width={56}
              height={56}
              priority
              className="h-12 w-12 shrink-0 rounded-full bg-[#f7f3ea] object-cover ring-2 ring-sma-gold"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-wide">Sharjah Maritime Academy</p>
              <p className="truncate text-xs text-white/70">e-Permit Portal · Khorfakkan</p>
            </div>
          </Link>
          <nav className="flex shrink-0 items-center gap-2 text-sm">
            <ThemeToggle />
            <Link href="/status" className="hidden rounded-full px-3 py-1.5 text-white/80 hover:bg-white/10 sm:inline">
              Track status
            </Link>
            <Link href="/admin/login" className="rounded-full bg-sma-gold px-3 py-1.5 font-medium text-sma-navy">
              EHS login
            </Link>
          </nav>
        </div>
        <div className="h-1 bg-sma-gold" />
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 pb-24">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {formRef && <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Ref {formRef}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
