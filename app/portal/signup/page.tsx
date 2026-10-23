"use client";

import { useState } from "react";
import Link from "next/link";
import { registerContractor } from "@/app/actions/account";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { FileUploadField } from "@/components/file-upload-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FilePayload } from "@/app/actions/submissions";

export default function PortalSignupPage() {
  const [company, setCompany] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [licenseFiles, setLicenseFiles] = useState<FilePayload[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    const nextPath = new URLSearchParams(window.location.search).get("next") || "/portal";
    const result = await registerContractor({
      companyName: company,
      tradeLicenseNo: licenseNo,
      tradeLicenseExpiry: licenseExpiry,
      email,
      password,
      tradeLicenses: licenseFiles,
      nextPath,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice(result.notice);
  }

  return (
    <SiteShell title="Create a contractor account">
      <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border">
        <p className="text-sm text-muted-foreground">
          Use this account to submit permits, then track them in one place. A verification email opens on this portal.
        </p>
        <div>
          <Label>Company name</Label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Trade license no.</Label>
            <Input value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} required />
          </div>
          <div>
            <Label>Trade license expiry</Label>
            <Input type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} required />
          </div>
        </div>
        <FileUploadField
          label="Trade license"
          files={licenseFiles}
          onChange={setLicenseFiles}
          multiple
          required
        />
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div>
          <Label>Set password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </div>
        {error && <p className="rounded-lg bg-red-600/90 px-3 py-2 text-sm text-white">{error}</p>}
        {notice && <p className="rounded-lg bg-green-700/90 px-3 py-2 text-sm text-white">{notice}</p>}
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
