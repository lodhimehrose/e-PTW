"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const forms = [
  { name: "Standard Permit to Work", path: "/ptw/standard" },
  { name: "Emergency breakdown PTW", path: "/ptw/emergency" },
];

export default function AdminQrPage() {
  const [qrs, setQrs] = useState<Record<string, string>>({});
  const [base, setBase] = useState(
    process.env.NEXT_PUBLIC_SITE_URL || "",
  );

  useEffect(() => {
    const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
    const configured =
      fromEnv && !fromEnv.includes("your-app.vercel.app")
        ? fromEnv.replace(/\/$/, "")
        : window.location.origin;
    setBase(configured);
  }, []);

  useEffect(() => {
    if (!base) return;
    forms.forEach(async (f) => {
      const url = `${base}${f.path}`;
      const data = await QRCode.toDataURL(url, { width: 280, margin: 2 });
      setQrs((prev) => ({ ...prev, [f.path]: data }));
    });
  }, [base]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sma-navy">QR codes &amp; links</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {forms.map((f) => {
          const url = `${base}${f.path}`;
          return (
            <Card key={f.path}>
              <CardHeader>
                <CardTitle className="text-base">{f.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-center">
                {qrs[f.path] && (
                  <img src={qrs[f.path]} alt="QR" className="mx-auto" />
                )}
                <p className="break-all text-xs">{url}</p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(url)}
                >
                  Copy link
                </Button>
                {qrs[f.path] && (
                  <Button asChild size="sm" variant="outline">
                    <a href={qrs[f.path]} download={`qr-${f.path.replace(/\//g, "")}.png`}>
                      Download PNG
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
