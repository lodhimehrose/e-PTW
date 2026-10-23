import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createAuthServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = (url.searchParams.get("type") || "signup") as EmailOtpType;
  const next = url.searchParams.get("next") || "/portal";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/portal";
  if (!tokenHash) {
    return NextResponse.redirect(new URL("/portal/login?error=This+verification+link+is+incomplete.", url.origin));
  }
  const supabase = await createAuthServerClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) {
    return NextResponse.redirect(new URL(`/portal/login?error=${encodeURIComponent(error.message)}`, url.origin));
  }
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
