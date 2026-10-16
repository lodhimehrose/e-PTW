export type HseSectionId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export type HseSection = {
  id: HseSectionId;
  title: string;
  items: string[];
};

export const HSE_SECTIONS: HseSection[] = [
  {
    id: "A",
    title: "General",
    items: [
      "A1) Always use the designated services access area only.",
      "A2) Work personnel are required to always display a security pass / Gate Pass.",
      "A19) All workers know the emergency assembly point and SMA Security emergency number.",
    ],
  },
  {
    id: "B",
    title: "Hot Work Requirements",
    items: ["B1) Charged hose-reel required to reach all areas."],
  },
  {
    id: "C",
    title: "Working at Height Requirements",
    items: ["C10) Full body harness with double lanyard worn at 1.8 m and above."],
  },
  { id: "D", title: "Equipment Statutory Requirements", items: ["D1) Valid third-party testing certificate."] },
  { id: "E", title: "Confined Space Requirements", items: ["E4) Air monitoring before entry."] },
  { id: "F", title: "Energized Electrical Work Requirements", items: ["F13) Zero energy verified before work starts."] },
  { id: "G", title: "Excavation Requirements", items: ["G1) Underground services identified before digging."] },
  { id: "H", title: "Crane / Hoist / Lifting Requirements", items: ["H1) Lifting plan approved before the lift."] },
];
