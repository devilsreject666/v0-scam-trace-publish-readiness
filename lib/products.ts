export interface Product {
  id: string;
  name: string;
  description: string;
  priceMonthly: number; // cents
  priceYearly: number; // cents per month, billed yearly
  mode: "subscription";
}

export const PRODUCTS: Product[] = [
  {
    id: "starter",
    name: "ScamTrace Starter",
    description: "Evidence templates & basic investigation tools",
    priceMonthly: 900,
    priceYearly: 700,
    mode: "subscription",
  },
  {
    id: "pro",
    name: "ScamTrace Pro",
    description: "Scam reports, monitoring dashboard & unlimited scans",
    priceMonthly: 1900,
    priceYearly: 1500,
    mode: "subscription",
  },
  {
    id: "investigator",
    name: "ScamTrace Investigator",
    description:
      "Full investigation suite with OSINT, API access & dedicated support",
    priceMonthly: 4900,
    priceYearly: 3900,
    mode: "subscription",
  },
];
