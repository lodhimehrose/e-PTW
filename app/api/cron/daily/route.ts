import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { format } from "date-fns";
import { dubaiToday } from "@/lib/working-days";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const today = format(dubaiToday(), "yyyy-MM-dd");

  const { data: ending } = await supabase
    .from("submissions")
    .select("ref_no, company_name, end_at, status")
    .gte("end_at", `${today}T00:00:00`)
    .lte("end_at", `${today}T23:59:59`);

  const { data: overdue } = await supabase
    .from("submissions")
    .select("ref_no, company_name, end_at, status")
    .lt("end_at", new Date().toISOString())
    .in("status", ["approved", "approved_with_conditions", "active"]);

  for (const row of overdue ?? []) {
    await supabase
      .from("submissions")
      .update({ status: "expired" })
      .eq("ref_no", row.ref_no);
  }

  const admin = process.env.ADMIN_EMAIL;
  if (admin) {
    const lines = [
      `<p><strong>Daily permit summary — ${today}</strong></p>`,
      `<p>Ending today: ${(ending ?? []).length}</p>`,
      `<p>Overdue not closed (marked expired): ${(overdue ?? []).length}</p>`,
      "<ul>",
      ...(overdue ?? []).map(
        (r) => `<li>${r.ref_no} — ${r.company_name} — ${r.status}</li>`,
      ),
      "</ul>",
    ].join("");
    await sendEmail({
      to: admin,
      subject: `SMA permits daily — ${today}`,
      html: lines,
    });
  }

  return NextResponse.json({ ok: true, ending: ending?.length, overdue: overdue?.length });
}
