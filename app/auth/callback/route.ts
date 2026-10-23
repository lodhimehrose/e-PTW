import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/portal";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/portal";
  if (!code) {
    return NextResponse.redirect(new URL("/portal/login?error=This+verification+link+is+incomplete.", url.origin));
  }
  const supabase = await createAuthServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/portal/login?error=${encodeURIComponent(error.message)}`, url.origin));
  }
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
