// PLACEHOLDER: datos de ejemplo (teléfono del rango ficticio de Ofcom). Sustituir por los reales.
export const siteInfo = {
  name: "Brew and Co",
  streetAddress: "12 Example Street",
  locality: "London",
  postalCode: "N1 0AA",
  country: "GB",
  phone: "020 7946 0000",
} as const;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
