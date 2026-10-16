"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function SignOutButton({
  redirectTo,
  className = "",
}: {
  redirectTo: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className={cn(
        "rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60",
        className,
      )}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
