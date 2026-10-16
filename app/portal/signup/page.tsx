"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const adminEmail = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "lodhimehrose@gmail.com"
).toLowerCase();

export default function PortalSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    if (email.toLowerCase() === adminEmail) {
      setError("This email is reserved for the EHS officer.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Use at least 6 characters for the password.");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, company_name: company },
        emailRedirectTo: `${window.location.origin}/portal`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (!data.session) {
      setNotice("Account created. Confirm the email from Supabase, then sign in.");
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  return (
    <SiteShell title="Create a contractor account">
      <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border">
        <p className="text-sm text-muted-foreground">
          Use this account to submit gate passes and permits, then track them in one place.
        </p>
        <div>
          <Label>Full name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Company</Label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} required />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {notice && <p className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground">{notice}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/portal/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </SiteShell>
  );
}
