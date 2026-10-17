"use client";

import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUploadField } from "@/components/file-upload-field";

type Props = {
  onChange: (dataUrl: string | undefined) => void;
  error?: string;
};

export function SignaturePadField({ onChange, error }: Props) {
  const ref = useRef<SignatureCanvas>(null);

  return (
    <div>
      <Label>Signature *</Label>
      <div className="mt-2 rounded-md border border-dashed border-slate-300 bg-white">
        <SignatureCanvas
          ref={ref}
          penColor="#13294B"
          canvasProps={{
            className: "w-full h-40 rounded-md",
          }}
          onEnd={() => {
            const url = ref.current?.toDataURL("image/png");
            onChange(url);
          }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Draw in the box, or upload a picture of the signature.</p>
      <div className="mt-2">
        <FileUploadField
          label="Upload signature"
          files={[]}
          onChange={(files) => {
            const file = files[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) return;
            onChange(`data:${file.type};base64,${file.base64}`);
          }}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2"
        onClick={() => {
          ref.current?.clear();
          onChange(undefined);
        }}
      >
        Clear signature
      </Button>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
