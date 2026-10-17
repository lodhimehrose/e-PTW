import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { formFor } from "@/lib/forms";
import { selectedKeys, statementsFrom } from "@/lib/forms/shared";
import { FORM_07_UNDERTAKINGS } from "@/lib/forms/form-07";

const navy = "#13294B";
const gold = "#B8963E";

const styles = StyleSheet.create({
  page: { padding: 28, paddingBottom: 42, fontSize: 7.5, fontFamily: "Helvetica", color: "#111" },
  header: { flexDirection: "row", borderWidth: 1, borderColor: "#808080", padding: 6 },
  title: { fontFamily: "Helvetica-Bold", fontSize: 11, color: navy },
  italic: { fontFamily: "Helvetica-Oblique", fontSize: 7 },
  gold: { height: 3, backgroundColor: gold, marginBottom: 4 },
  instructions: { backgroundColor: "#F5F5F5", padding: 4, marginBottom: 4 },
  section: { flexDirection: "row", backgroundColor: navy, color: "white", marginTop: 4 },
  sectionCode: { width: 70, fontFamily: "Helvetica-Bold", fontSize: 7, padding: 3 },
  sectionTitle: { flex: 1, fontFamily: "Helvetica-Bold", fontSize: 7, padding: 3 },
  row: { flexDirection: "row", flexWrap: "wrap", borderLeftWidth: 1, borderColor: "#808080" },
  cell: { borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#808080", padding: 3 },
  label: { fontFamily: "Helvetica-Bold", fontSize: 6, color: "#333" },
  value: { fontSize: 7.5 },
  checkRow: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderColor: "#808080", padding: 3 },
  check: { width: 8, height: 8, borderWidth: 1, borderColor: "#111", marginRight: 3, alignItems: "center", justifyContent: "center" },
  footer: { position: "absolute", bottom: 16, left: 28, right: 28, fontSize: 6, fontFamily: "Helvetica-Oblique", color: "#555" },
  stamp: { marginTop: 8, padding: 6, borderWidth: 2, borderColor: "#00A651", color: "#00A651", fontFamily: "Helvetica-Bold", fontSize: 12, textAlign: "center" },
});

export type PdfSubmission = {
  refNo: string;
  type: string;
  formTitle: string;
  companyName: string;
  status: string;
  data: Record<string, unknown>;
  workers?: Array<{ full_name: string; trade: string; emirates_id: string; eid_expiry: string; mobile?: string }>;
  approved?: { adminName: string; signedAt: string; conditions?: string; qrDataUrl?: string };
  logoDataUrl?: string;
  signatureDataUrl?: string;
};

function show(value: unknown) {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.map(String).join(", ");
  return String(value);
}

function Check({ on }: { on: boolean }) {
  return <View style={styles.check}>{on ? <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold" }}>X</Text> : null}</View>;
}

export function SubmissionPdf({ sub }: { sub: PdfSubmission }) {
  const form = formFor(sub.type, sub.data);
  const values: Record<string, unknown> = {
    ...sub.data,
    companyName: sub.companyName,
  };
  const statements = statementsFrom(sub.data.undertakings, FORM_07_UNDERTAKINGS);
  const workers = sub.workers ?? [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={{ width: 70 }}>{sub.logoDataUrl ? <Image src={sub.logoDataUrl} style={{ width: 48, height: 48 }} /> : <Text>SMA</Text>}</View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{form.title}</Text>
            <Text style={styles.italic}>{form.reference}</Text>
          </View>
          <View style={{ width: 140, alignItems: "flex-end" }}>
            <Text style={styles.italic}>For Official Use Only</Text>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>{form.numberLabel} {sub.refNo}</Text>
          </View>
        </View>
        <View style={styles.gold} fixed />
        <View style={styles.instructions}>
          {form.instructions.map((line) => <Text key={line}>{line}</Text>)}
        </View>
        {form.sections.filter((section) => section.id !== "approval").map((section) => (
          <View key={section.id} wrap>
            <View style={styles.section}>
              <Text style={styles.sectionCode}>{section.code}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.fields.map((field) => {
              if (field.type === "table" && (field.key === "workers" || field.key === "supervisor")) {
                return (
                  <View key={field.key}>
                    <View style={{ flexDirection: "row", backgroundColor: "#F5F5F5" }}>
                      {["S/N", "Name", "Trade", "Emirates ID", "Expiry", "Mobile"].map((heading) => (
                        <Text key={heading} style={{ flex: 1, fontFamily: "Helvetica-Bold", fontSize: 6, borderWidth: 0.5, borderColor: "#808080", padding: 2 }}>{heading}</Text>
                      ))}
                    </View>
                    {workers.map((worker, index) => (
                      <View key={worker.emirates_id} style={{ flexDirection: "row" }}>
                        {[String(index + 1), worker.full_name, worker.trade, worker.emirates_id, String(worker.eid_expiry).slice(0, 10), worker.mobile || ""].map((cell, cellIndex) => (
                          <Text key={cellIndex} style={{ flex: 1, fontSize: 7, borderWidth: 0.5, borderColor: "#808080", padding: 2 }}>{cell}</Text>
                        ))}
                      </View>
                    ))}
                  </View>
                );
              }
              if (field.type === "checkboxGroup" || field.type === "radio") {
                const picked = selectedKeys(values[field.key], field.options || []);
                return (
                  <View key={field.key} style={styles.checkRow}>
                    <Text style={styles.label}>{field.label}</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 2 }}>
                      {(field.options || []).map((option) => (
                        <View key={option.key} style={{ flexDirection: "row", alignItems: "center", width: "48%", marginBottom: 2 }}>
                          <Check on={picked.includes(option.key)} />
                          <Text>{option.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              }
              if (field.type === "statement") {
                const match = statements.find((item) => item.text === field.label);
                return (
                  <View key={field.key} style={{ flexDirection: "row", borderWidth: 0.5, borderColor: "#808080", padding: 2 }}>
                    <Check on={match ? match.accepted : Boolean(values.declarantName)} />
                    <Text style={{ flex: 1 }}>{field.label}</Text>
                  </View>
                );
              }
              if (field.type === "signature") {
                return (
                  <View key={field.key} style={styles.cell}>
                    <Text style={styles.label}>Signature · {show(values.declarantName)}</Text>
                    {sub.signatureDataUrl ? <Image src={sub.signatureDataUrl} style={{ width: 120, height: 36 }} /> : <Text>—</Text>}
                  </View>
                );
              }
              if (field.type === "table" || field.type === "fileList") return null;
              return (
                <View key={field.key} style={styles.cell}>
                  <Text style={styles.label}>{field.label}</Text>
                  <Text style={styles.value}>{show(values[field.key])}</Text>
                </View>
              );
            })}
          </View>
        ))}
        {sub.approved && (
          <View>
            <Text style={styles.stamp}>APPROVED</Text>
            <Text>{sub.approved.adminName} · {sub.approved.signedAt}</Text>
            {sub.approved.conditions ? <Text>Conditions: {sub.approved.conditions}</Text> : null}
            {sub.approved.qrDataUrl ? <Image src={sub.approved.qrDataUrl} style={{ width: 70, height: 70, marginTop: 4 }} /> : null}
          </View>
        )}
        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `SMA e-Permit Portal · uncontrolled if printed · Page ${pageNumber} of ${totalPages}`} />
      </Page>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionCode}>SECTION VI</Text>
          <Text style={styles.sectionTitle}>HEALTH, SAFETY AND ENVIRONMENT REQUIREMENTS</Text>
        </View>
        {form.hse.map((block) => (
          <View key={block.id} style={{ marginTop: 4 }}>
            <Text style={{ backgroundColor: "#DCE6F3", fontFamily: "Helvetica-Bold", color: navy, padding: 2 }}>{block.id}) {block.title}</Text>
            {block.items.map((item) => (
              <View key={item} style={{ flexDirection: "row", marginTop: 1 }}>
                <Check on />
                <Text>{item}</Text>
              </View>
            ))}
          </View>
        ))}
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <Text style={{ backgroundColor: "#16a34a", color: "white", padding: 3, marginRight: 4 }}>GREEN TAG – Safe for use</Text>
          <Text style={{ backgroundColor: "#fde047", padding: 3, marginRight: 4 }}>YELLOW TAG – Caution</Text>
          <Text style={{ backgroundColor: "#dc2626", color: "white", padding: 3 }}>RED TAG – Do not use</Text>
        </View>
        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `SMA e-Permit Portal · uncontrolled if printed · Page ${pageNumber} of ${totalPages}`} />
      </Page>
    </Document>
  );
}
