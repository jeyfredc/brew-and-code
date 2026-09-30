import type { BadgeId } from "@/data/menu";

const styles: Record<BadgeId, string> = {
  popular: "bg-naranja text-espresso",
  "house-favourite": "bg-foreground text-background",
};

export function Badge({ kind, label }: { kind: BadgeId; label: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles[kind]}`}>
      {label}
    </span>
  );
}
