import { Suspense } from "react";
import { AdminLoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-center text-sm text-muted-foreground">Loading…</p>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
