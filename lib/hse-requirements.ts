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
      "A2) Work personnel are required to always display a security pass.",
      "A3) No smoking policy in SMA.",
      "A4) Do not use staff toilets or pantry, and do not sleep on SMA premises.",
      "A5) Ensure workers are equipped with appropriate PPE (safety shoes, helmet, gloves, and other task-specific equipment).",
      "A6) Ensure safe working at height, including valid training certificates.",
      "A7) Ensure safe use of equipment (electrical tools, ladders, etc.).",
      "A8) Maintain good electrical set-up and cable protection.",
      "A9) All doors must be locked after work, and proper housekeeping ensured.",
      "A10) Safety induction forms (workers) shall be submitted for closing of security pass.",
      "A11) All risk assessments for the work shall be conducted and briefed to all personnel prior to work.",
      "A12) Adequate floor protection must be provided.",
      "A13) Activities must not produce fumes or odors in common areas.",
      "A14) A copy of the permit must always be available at the workplace.",
      "A15) Tools and materials shall be screened and registered at the security checkpoint.",
      "A16) No noisy or dusty work during working hours.",
    ],
  },
  {
    id: "B",
    title: "Hot Work Requirements",
    items: [
      "B1) Charged hose-reel available to reach all areas.",
      "B2) Fire extinguishers are required, in service and operable.",
      "B3) Combustible materials, flammable liquids, dust and oil deposits removed.",
      "B4) No storage of gas cylinders on SMA premises.",
      "B5) Flashback arrestors in place at cutting torch inlets and gas regulator outlet.",
      "B6) Fire watcher present during the hot work process.",
      "B7) Gas cylinders are kept in the cylinder cage.",
      "B8) Hot work equipment in good condition.",
      "B9) Good housekeeping maintained.",
      "B10) Combustible floor wet down, covered with damp sand or fire-resistant sheets.",
      "B11) Fire-resistant tarpaulin suspended underneath the work.",
      "B12) Hot works at locations near drains.",
      "B13) Dust installation to be cut back one meter from both sides.",
      "B14) Where ducting adds to a junction, the insulation must be cut back two meters from the junction.",
    ],
  },
  {
    id: "C",
    title: "Working at Height Requirements",
    items: [
      "C1) Tools and materials secured from falling.",
      "C2) Overhead fixtures meet safety requirements and are strong enough to carry the working crew.",
      "C3) Mobile scaffold level and wheels locked when in use, the scaffold must not be overloaded, and outriggers in place for stability.",
      "C4) Proper, secure working platform and safe access provided.",
      "C5) Pre-inspection of equipment conducted before use.",
      "C6) Areas at risk not barricaded, and near, live wires.",
      "C7) Effective guardrails / lifelines provided to anchor safety harnesses.",
      "C8) Temporary catwalks provided where necessary.",
    ],
  },
  {
    id: "D",
    title: "Equipment Statutory Requirements",
    items: [
      "D1) Valid third-party testing certificate approved by Sharjah Government.",
      "D2) RTA vehicle registration card.",
      "D3) Certificates of trained, authorized operators.",
      "D4) Suitable RTA driving license (e.g. Class 8).",
    ],
  },
  {
    id: "E",
    title: "Confined Space Requirements",
    items: [
      "E1) Additional safety equipment: tripod, lifeline, ventilation fan blower, self-contained breathing apparatus, air respirator, special gloves (leather, impervious, chemical-resistant), face shield.",
      "E2) Removal of debris and deposits.",
      "E3) Isolation of plant, power and equipment.",
      "E4) Air flush (preliminary and continuous) carried out.",
      "E5) Air monitoring to ensure O2 19.5–23.5%, LEL/LFL <10%, CO <25 ppm, H2S <10 ppm.",
    ],
  },
  {
    id: "F",
    title: "Energized Electrical Work Requirements",
    items: [
      "F1) Additional safety equipment: non-conductive head protection, rubber sleeves, safety glasses, non-conductive clothing, arc-blast face shield, non-conductive ladder.",
      "F2) Qualified personnel assigned to perform the work.",
      "F3) First-aid personnel in CPR and first aid present.",
      "F4) Equipment de-energized and isolated to the extent feasible.",
      "F5) Insulating protective equipment used (line hoses, rubber insulating matting).",
      "F6) Separate tagging system for isolation points, with lock and key for each, and keys are held by the person-in-charge and returned to security after work completion.",
      "F7) A standby person equipped with insulation equipment for emergency response.",
      "F8) Voltage-rated insulated tools provided.",
      "F9) Adequate working clearance and egress routes provided.",
      "F10) Communication is available and in operating condition.",
      "F11) Conductive items removed (e.g. metal rings, watches).",
      "F12) Testing equipment at the worksite compatible with the voltage present.",
    ],
  },
  {
    id: "G",
    title: "Excavation Requirements",
    items: [
      "G1) Underground services identified before digging.",
      "G2) Excavation barricaded and signed.",
      "G3) Spoil kept clear of the edge.",
    ],
  },
  {
    id: "H",
    title: "Crane / Hoist / Lifting Requirements",
    items: [
      "H1) Lifting plan approved before the lift.",
      "H2) Certified equipment and appointed person in charge.",
      "H3) Exclusion zone in place under the load.",
    ],
  },
];
