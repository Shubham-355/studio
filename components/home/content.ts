export const STUDIO_NAME = "Studio";

export type Stage = { num: string; name: string; d: string };
export type Company = {
  n: string;
  name: string;
  what: string;
  built: string;
  result: string;
  v: number;
  stand: boolean;
};
export type Keep = {
  n: string;
  t: string;
  d: string;
  kind: "book" | "box" | "screen" | "scroll" | "dome" | "pawns";
  p: [number, number];
  pn: [number, number];
};

export const STAGES: Stage[] = [
  { num: "01", name: "Discover", d: "We research the market and the people it serves." },
  { num: "02", name: "Shape", d: "We define the brand, the product and the business plan." },
  { num: "03", name: "Build", d: "We write the software, add AI and set up the infrastructure." },
  { num: "04", name: "Launch", d: "We take the company to market." },
  { num: "05", name: "Grow", d: "We improve it with data, scale the systems and hire the team that takes over." },
];

export const COMPANIES: Company[] = [
  { n: "01", name: "Halcyon Freight", what: "A freight booking company.", built: "the brand, the iOS app, AI onboarding and AWS infrastructure.", result: "0 to 40k users in 6 months.", v: 0, stand: true },
  { n: "02", name: "Mireille Health", what: "A patient care company.", built: "the name, the patient web app and HIPAA-ready cloud.", result: "$6.2M raised on the prototype.", v: 1, stand: false },
  { n: "03", name: "Lanternfish", what: "A customer support company.", built: "the identity, the first product and the support automations.", result: "72% of tickets resolved automatically.", v: 2, stand: true },
  { n: "04", name: "Orrery Labs", what: "A data company.", built: "the internal tools, the data platform and the GCP setup.", result: "11 hours saved per operator each week.", v: 3, stand: false },
];

export const KEEP: Keep[] = [
  { n: "01", t: "A brand book", d: "Name, mark, type, color and voice, written down.", kind: "book", p: [0.07, 0.99], pn: [0.14, 0.99] },
  { n: "02", t: "A design system", d: "Every component documented and ready to extend.", kind: "box", p: [0.29, 0.99], pn: [0.62, 0.99] },
  { n: "03", t: "A live product", d: "Shipped, monitored and in customers’ hands.", kind: "screen", p: [0.65, 0.99], pn: [0.8, 0.64] },
  { n: "04", t: "The source code", d: "In your repository, readable by your next hire.", kind: "scroll", p: [0.18, 0.99], pn: [0.38, 0.99] },
  { n: "05", t: "Cloud accounts in your name", d: "You own the infrastructure and the bill.", kind: "dome", p: [0.77, 0.99], pn: [0.84, 0.82] },
  { n: "06", t: "A team trained to run it", d: "Your people, onboarded before we step back.", kind: "pawns", p: [0.89, 0.99], pn: [0.86, 0.99] },
];

// Small drawings that orbit each founder's head before they resolve into a company.
export const THOUGHTS = [
  ["box", "form", "rope", "clock"],
  ["form", "pill", "card"],
  ["letter", "phone", "bubble"],
  ["thread", "number", "gear"],
];

export function emailFor(name: string) {
  return `hello@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
}
