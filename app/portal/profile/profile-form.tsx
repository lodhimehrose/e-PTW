"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword, updateProfile } from "./actions";

export function ProfileForm({
  name,
  company,
  phone,
  email,
  viewingAsAdmin = false,
}: {
  name: string;
  company: string;
  phone: string;
  email: string;
  viewingAsAdmin?: boolean;
}) {
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function onProfile(formData: FormData) {
    setSavingProfile(true);
    setProfileError("");
    setProfileMessage("");
    const result = await updateProfile(formData);
    setSavingProfile(false);
    if (!result.ok) setProfileError(result.error);
    else setProfileMessage("Profile saved.");
  }

  async function onPassword(formData: FormData) {
    setSavingPassword(true);
    setPasswordError("");
    setPasswordMessage("");
    const result = await updatePassword(formData);
    setSavingPassword(false);
    if (!result.ok) setPasswordError(result.error);
    else setPasswordMessage("Password updated.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onProfile(new FormData(e.currentTarget));
        }}
        className="space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border"
      >
        <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        <div>
          <Label>Email</Label>
          <Input value={email} disabled />
        </div>
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" defaultValue={name} required />
        </div>
        <div>
          <Label htmlFor="company_name">Company</Label>
          <Input id="company_name" name="company_name" defaultValue={company} required />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={phone} />
        </div>
        {profileError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{profileError}</p>}
        {profileMessage && <p className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground">{profileMessage}</p>}
        <Button type="submit" disabled={savingProfile}>
          {savingProfile ? "Saving…" : "Save profile"}
        </Button>
      </form>

      {!viewingAsAdmin && (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onPassword(new FormData(e.currentTarget));
        }}
        className="space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border"
      >
        <h2 className="text-lg font-semibold text-foreground">Password</h2>
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
        </div>
        {passwordError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{passwordError}</p>}
        {passwordMessage && <p className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground">{passwordMessage}</p>}
        <Button type="submit" disabled={savingPassword}>
          {savingPassword ? "Updating…" : "Update password"}
        </Button>
      </form>
      )}
    </div>
  );
}
