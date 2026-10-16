import { createServiceClient } from "@/lib/supabase/server";

const BUCKET = "submissions";

export async function uploadBuffer(
  path: string,
  buffer: Buffer,
  contentType: string,
) {
  const supabase = createServiceClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  return path;
}

export async function uploadDataUrl(path: string, dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");
  const buffer = Buffer.from(match[2], "base64");
  return uploadBuffer(path, buffer, match[1]);
}

export async function getSignedUrl(path: string, expiresIn = 3600) {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) throw error ?? new Error("No signed URL");
  return data.signedUrl;
}
