// Client-safe pricing display catalog (marketing copy + prices) for the pricing
// page and pricing wall. The source of truth for runtime gating/quotas is
// plans.server.js — keep the prices/quotas here in sync with that file and with
// the plans created in the Partner Dashboard.
//
// Note: because this is a Managed Pricing app, every "Choose plan" button sends
// the merchant to Shopify's hosted pricing page where they pick the real plan —
// the per-tier buttons here are purely informational about what they'll get.
export const PLAN_TIERS = [
  {
    name: "Free",
    price: 0,
    priceAnnual: 0,
    images: "100",
    tagline: "Test it on part of your catalog",
    features: [
      "100 images compressed per month",
      "WebP photos swapped in on the product",
    ],
  },
  {
    name: "Starter",
    price: 30,
    priceAnnual: 300,
    images: "2,000",
    tagline: "Shops with a steady catalog",
    features: [
      "2,000 images per month",
      "All Free features",
      "Alt Text for each product",
    ],
  },
  {
    name: "Growth",
    price: 99,
    priceAnnual: 990,
    images: "15,000",
    tagline: "Shops that add products often",
    popular: true,
    features: [
      "15,000 images per month",
      "All Starter features",
      "Auto-Optimize for new products",
      "Page Speed tests (Lighthouse)",
    ],
  },
  {
    name: "Pro",
    price: 350,
    priceAnnual: 3500,
    images: "50,000",
    tagline: "Large and fast-moving catalogs",
    features: [
      "50,000 images per month",
      "All Growth features",
      "Largest monthly image allowance",
    ],
  },
];
