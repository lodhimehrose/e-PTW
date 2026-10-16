import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { ref, email } = await req.json();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("submissions")
    .select("status, contact_email, ref_no")
    .eq("ref_no", String(ref).trim().toUpperCase())
    .maybeSingle();

  if (!data || data.contact_email?.toLowerCase() !== String(email).toLowerCase()) {
    return NextResponse.json({ message: "No match for this reference and email." });
  }
  return NextResponse.json({
    message: `${data.ref_no}: ${data.status.replace(/_/g, " ").toUpperCase()}`,
  });
}
