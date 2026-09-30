import type { CategoryId } from "@/data/menu";

export type Tone = "naranja" | "mostaza" | "menta" | "durazno" | "frambuesa";

export const categoryTone: Record<CategoryId, Tone> = {
  espresso: "mostaza",
  pastries: "frambuesa",
  sandwiches: "durazno",
  cold: "menta",
};

export const toneBg: Record<Tone, string> = {
  naranja: "bg-naranja",
  mostaza: "bg-mostaza",
  menta: "bg-menta",
  durazno: "bg-durazno",
  frambuesa: "bg-frambuesa",
};
