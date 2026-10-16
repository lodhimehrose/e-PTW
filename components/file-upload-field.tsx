"use client";

import { Label } from "@/components/ui/label";
import type { FilePayload } from "@/app/actions/submissions";

const MAX = 10 * 1024 * 1024;

type Props = {
  label: string;
  files: FilePayload[];
  onChange: (files: FilePayload[]) => void;
  multiple?: boolean;
};

function fileToPayload(file: File): Promise<FilePayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ name: file.name, type: file.type, base64 });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function FileUploadField({ label, files, onChange, multiple }: Props) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="file"
        className="mt-2 block w-full text-sm"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple={multiple}
        onChange={async (e) => {
          const list = e.target.files;
          if (!list?.length) return;
          const next: FilePayload[] = [];
          for (const f of Array.from(list)) {
            if (f.size > MAX) {
              alert(`${f.name} exceeds 10 MB`);
              continue;
            }
            next.push(await fileToPayload(f));
          }
          onChange(multiple ? [...files, ...next] : next);
        }}
      />
      {files.length > 0 && (
        <ul className="mt-2 text-xs text-muted-foreground">
          {files.map((f) => (
            <li key={f.name}>{f.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
