import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "accent" | "light" | "ghost";
export type ButtonSize = "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-foreground text-background hover:bg-cacao dark:hover:bg-espuma",
  accent: "bg-naranja-fuerte text-white hover:bg-naranja-profundo",
  light: "bg-espuma text-espresso hover:bg-crema",
  ghost: "border border-line text-foreground hover:bg-surface",
};
const sizeClasses: Record<ButtonSize, string> = { md: "h-11 px-6", lg: "h-[52px] px-7" };

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") {
  return `inline-flex items-center justify-center gap-3 rounded-full text-base font-semibold tracking-[0.01em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${extra}`.trim();
}

type Shared = { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant, size, className, type = "button", ...props }: Shared & ComponentProps<"button">) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: Shared & ComponentProps<typeof Link>) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
