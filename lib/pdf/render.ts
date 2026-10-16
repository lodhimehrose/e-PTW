import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { SubmissionPdf, type PdfSubmission } from "./documents";

export async function renderSubmissionPdf(sub: PdfSubmission): Promise<Buffer> {
  const element = React.createElement(SubmissionPdf, { sub }) as Parameters<
    typeof renderToBuffer
  >[0];
  const buf = await renderToBuffer(element);
  return Buffer.from(buf);
}
