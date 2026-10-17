import { readFileSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth";
import { renderSubmissionPdf } from "@/lib/pdf/render";
import { formDisplayName } from "@/lib/email/send";
import { createAuthServerClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: { ref: string } }) {
  const ref = decodeURIComponent(params.ref);
  const token = new URL(request.url).searchParams.get("token");
  const supabase = createServiceClient();
  const { data: sub } = await supabase
    .from("submissions")
    .select("*, workers(*)")
    .eq("ref_no", ref)
    .maybeSingle();
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let allowed = token && token === sub.verify_token;
  if (!allowed) {
    const auth = await createAuthServerClient();
    const { data: { user } } = await auth.auth.getUser();
    allowed = Boolean(
      user && (isAdminEmail(user.email) || user.id === sub.owner_id || user.email?.toLowerCase() === sub.contact_email?.toLowerCase()),
    );
  }
  if (!allowed) return NextResponse.json({ error: "Sign in to download this PDF." }, { status: 401 });

  const logo = readFileSync(path.join(process.cwd(), "public", "sma-logo.jpg")).toString("base64");
  const pdf = await renderSubmissionPdf({
    refNo: sub.ref_no,
    type: sub.type,
    formTitle: formDisplayName(sub.type),
    companyName: sub.company_name ?? "",
    status: sub.status,
    data: (sub.data as Record<string, unknown>) ?? {},
    workers: sub.workers ?? [],
    logoDataUrl: `data:image/jpeg;base64,${logo}`,
  });
  const filename = `${sub.ref_no} ${formDisplayName(sub.type)}.pdf`;
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
