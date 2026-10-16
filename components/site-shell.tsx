import Link from "next/link";
import Image from "next/image";

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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/sma-logo.svg" alt="SMA" width={56} height={56} className="h-14 w-14" priority />
            <div>
              <p className="text-sm font-semibold text-sma-navy">Sharjah Maritime Academy</p>
              <p className="text-xs text-muted-foreground">Khorfakkan, UAE</p>
            </div>
          </Link>
        </div>
        <div className="h-1 bg-sma-gold" />
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 pb-24">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-sma-navy">{title}</h1>
            {formRef && <p className="mt-1 text-xs text-muted-foreground">Ref: {formRef}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
