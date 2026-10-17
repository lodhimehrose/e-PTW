"use client";

import { Label } from "@/components/ui/label";
import type { FilePayload } from "@/app/actions/submissions";

const MAX = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp,.bmp,.heic,.tif,.tiff";
const ALLOWED = new Set(ACCEPT.split(","));

type Props = {
  label: string;
  files: FilePayload[];
  onChange: (files: FilePayload[]) => void;
  multiple?: boolean;
  required?: boolean;
};

function extension(name: string) {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

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

export function FileUploadField({ label, files, onChange, multiple, required }: Props) {
  return (
    <div>
      <Label>
        {label}
        {required ? " *" : ""}
      </Label>
      <p className="mt-1 text-xs text-muted-foreground">
        PDF, Word, Excel, or pictures. Up to 10 MB each.
      </p>
      <input
        type="file"
        className="mt-2 block w-full text-sm"
        accept={ACCEPT}
        multiple={multiple}
        required={required && files.length === 0}
        onChange={async (e) => {
          const list = e.target.files;
          if (!list?.length) return;
          const next: FilePayload[] = [];
          for (const f of Array.from(list)) {
            if (!ALLOWED.has(extension(f.name))) {
              alert(`${f.name} is not allowed. Use PDF, Word, Excel, or a picture.`);
              continue;
            }
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
