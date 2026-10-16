import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("submissions")
    .select("ref_no, type, status, company_name, building, contact_email, created_at")
    .order("created_at", { ascending: false });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Submissions");
  ws.addRow([
    "Ref",
    "Type",
    "Status",
    "Company",
    "Building",
    "Email",
    "Created",
  ]);
  (data ?? []).forEach((r) => {
    ws.addRow([
      r.ref_no,
      r.type,
      r.status,
      r.company_name,
      r.building,
      r.contact_email,
      r.created_at,
    ]);
  });

  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="submissions.xlsx"',
    },
  });
}
