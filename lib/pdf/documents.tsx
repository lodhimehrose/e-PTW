import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const navy = "#13294B";
const gold = "#B8963E";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8, fontFamily: "Helvetica" },
  headerRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#808080",
    padding: 6,
    marginBottom: 4,
  },
  title: { fontSize: 11, fontWeight: "bold", color: navy },
  goldBar: { height: 4, backgroundColor: gold, marginBottom: 8 },
  section: {
    backgroundColor: navy,
    color: "white",
    fontWeight: "bold",
    padding: 4,
    marginTop: 6,
    fontSize: 8,
  },
  row: { flexDirection: "row", marginTop: 2 },
  label: { width: "35%", color: "#333" },
  value: { width: "65%", fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 28,
    right: 28,
    fontSize: 6,
    color: "#666",
  },
  stamp: {
    marginTop: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: "#00A651",
    color: "#00A651",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export type PdfSubmission = {
  refNo: string;
  type: string;
  formTitle: string;
  companyName: string;
  status: string;
  data: Record<string, unknown>;
  workers?: Array<{
    full_name: string;
    trade: string;
    emirates_id: string;
    eid_expiry: string;
  }>;
  approved?: {
    adminName: string;
    signedAt: string;
    conditions?: string;
    qrDataUrl?: string;
  };
};

function linesFromData(data: Record<string, unknown>) {
  return Object.entries(data)
    .filter(([k]) => !["honeypot", "signatureDataUrl", "submittedAt"].includes(k))
    .slice(0, 40)
    .map(([k, v]) => ({
      k: k.replace(/([A-Z])/g, " $1"),
      v: typeof v === "object" ? JSON.stringify(v) : String(v ?? ""),
    }));
}

export function SubmissionPdf({ sub }: { sub: PdfSubmission }) {
  const permitLabel =
    sub.type === "gate_pass"
      ? "Gate Pass No."
      : sub.type === "ptw_emergency"
        ? "E-PTW No."
        : "Work Permit No.";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ width: "20%" }}>
            <Text>SMA</Text>
          </View>
          <View style={{ width: "50%" }}>
            <Text style={styles.title}>{sub.formTitle}</Text>
          </View>
          <View style={{ width: "30%", textAlign: "right" }}>
            <Text>Ref No: {sub.refNo}</Text>
            <Text style={{ fontStyle: "italic" }}>For Official Use Only</Text>
            <Text style={{ fontWeight: "bold" }}>
              {permitLabel}: {sub.refNo}
            </Text>
          </View>
        </View>
        <View style={styles.goldBar} />
        <Text style={styles.section}>SECTION I | APPLICANT INFORMATION</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Company</Text>
          <Text style={styles.value}>{sub.companyName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{sub.status}</Text>
        </View>
        {linesFromData(sub.data).map((line) => (
          <View key={line.k} style={styles.row}>
            <Text style={styles.label}>{line.k}</Text>
            <Text style={styles.value}>{line.v.slice(0, 120)}</Text>
          </View>
        ))}
        {sub.workers && sub.workers.length > 0 && (
          <>
            <Text style={styles.section}>WORKFORCE</Text>
            {sub.workers.map((w, i) => (
              <Text key={i}>
                {i + 1}. {w.full_name} — {w.trade} — {w.emirates_id}
              </Text>
            ))}
          </>
        )}
        {sub.approved && (
          <>
            <View style={styles.stamp}>
              <Text>APPROVED</Text>
            </View>
            <Text>
              {sub.approved.adminName} — {sub.approved.signedAt}
            </Text>
            {sub.approved.conditions && (
              <Text>Conditions: {sub.approved.conditions}</Text>
            )}
            {sub.approved.qrDataUrl && (
              <Image
                src={sub.approved.qrDataUrl}
                style={{ width: 72, height: 72, marginTop: 8 }}
              />
            )}
          </>
        )}
        <Text style={styles.footer}>
          Disclaimer: The applicant and their service provider are fully responsible for ensuring that the operation is carried out safely by competent people. Page 1 of 1
        </Text>
      </Page>
    </Document>
  );
}
