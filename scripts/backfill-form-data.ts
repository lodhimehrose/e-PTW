/**
 * Converts older undertaking arrays into statement records.
 * Run after the app can read Supabase: npx tsx scripts/backfill-form-data.ts
 */
import { createClient } from "@supabase/supabase-js";
import { FORM_07_UNDERTAKINGS } from "../lib/forms/form-07";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then run: npx tsx scripts/backfill-form-data.ts");
    return;
  }
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from("submissions").select("id, data");
  if (error) throw error;
  for (const row of data ?? []) {
    const current = (row.data ?? {}) as Record<string, unknown>;
    const value = current.undertakings;
    if (!Array.isArray(value) || value.some((item) => item && typeof item === "object" && "accepted" in item)) continue;
    const accepted = new Set(value.filter((item) => typeof item === "string") as string[]);
    const undertakings = FORM_07_UNDERTAKINGS.map((item, index) => ({
      key: item.key,
      text: item.text,
      accepted: typeof value[index] === "boolean" ? Boolean(value[index]) : accepted.has(item.text),
      acceptedAt: new Date().toISOString(),
    }));
    await supabase.from("submissions").update({ data: { ...current, undertakings } }).eq("id", row.id);
  }
  console.log("Backfill finished.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
