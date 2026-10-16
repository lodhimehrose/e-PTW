"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
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
    if (
      adminEmail &&
      user?.email?.toLowerCase() !== adminEmail
    ) {
      await supabase.auth.signOut();
      setError("Only the EHS officer email may access the admin panel.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-sma-navy">SMA Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground">
            Only the EHS officer account may sign in.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
