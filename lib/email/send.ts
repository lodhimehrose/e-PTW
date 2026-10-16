import { Resend } from "resend";

const resend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
};

function brandHtml(body: string) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
    <div style="background:#13294B;color:white;padding:16px;font-weight:bold">SMA e-Permit Portal</div>
    <div style="height:4px;background:#B8963E"></div>
    <div style="padding:20px;color:#333">${body}</div>
  </div>`;
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  const client = resend();
  if (!client) {
    console.warn("RESEND_API_KEY not set — email skipped:", opts.subject);
    return { ok: false as const, skipped: true };
  }
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
  const { error } = await client.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: brandHtml(opts.html),
    attachments: opts.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });
  if (error) {
    console.error(error);
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

export function formDisplayName(type: string) {
  if (type === "gate_pass") return "Contractor Gate Pass";
  if (type === "ptw_emergency") return "Emergency Permit to Work";
  return "Standard Permit to Work";
}
