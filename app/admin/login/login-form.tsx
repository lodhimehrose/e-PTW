"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const allowed = (
      process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "lodhimehrose@gmail.com"
    ).toLowerCase();
    if (email.toLowerCase() !== allowed) {
      setError("Only the designated EHS officer account may sign in.");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
    if (adminEmail && email.toLowerCase() !== adminEmail) {
      setLoading(false);
      setError("This account is not authorized for admin access.");
      return;
    }
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (adminEmail && user?.email?.toLowerCase() !== adminEmail) {
      await supabase.auth.signOut();
      setError("Only the EHS officer email may access the admin panel.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sma-navy px-12 py-12 text-white lg:flex">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
          <Image
            src="/sma-logo.jpg"
            alt="Sharjah Maritime Academy"
            width={64}
            height={64}
            priority
            className="h-16 w-16 rounded-full bg-[#f7f3ea] object-cover ring-2 ring-sma-gold"
          />
          <div>
            <p className="text-sm font-semibold">Sharjah Maritime Academy</p>
            <p className="text-xs text-white/70">Khorfakkan, UAE</p>
          </div>
          </Link>
          <ThemeToggle />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sma-gold">EHS officer access</p>
          <h1 className="mt-3 max-w-md text-4xl font-bold leading-tight">Review permits, gate passes, and approvals.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
            Only the designated Health, Safety and Environment account can open the admin panel.
          </p>
        </div>
        <p className="text-xs text-white/50">SMA e-Permit Portal</p>
      </div>
      <div className="flex items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 lg:hidden">
              <Image
                src="/sma-logo.jpg"
                alt="Sharjah Maritime Academy"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-sma-gold"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">SMA e-Permit</p>
                <p className="text-xs text-muted-foreground">EHS officer login</p>
              </div>
            </div>
            <div className="lg:hidden">
              <ThemeToggle tone="onLight" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use the EHS officer email and password.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <Link href="/" className="mt-6 inline-block text-sm text-foreground underline-offset-4 hover:underline">
            Back to forms
          </Link>
        </div>
      </div>
    </div>
  );
}
