import { motion } from "motion/react";
import type { ReactNode } from "react";

export function SceneShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`relative z-10 flex min-h-[100svh] w-full flex-col items-center justify-center px-6 py-16 safe-b safe-t ${className}`}
    >
      {children}
    </motion.section>
  );
}

export function SceneButton({
  children,
  onClick,
  variant = "solid",
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "solid" | "ghost";
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex min-h-11 items-center justify-center rounded-full px-7 text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
  const styles =
    variant === "solid"
      ? "text-[var(--scene-bg)] hover:scale-[1.03] active:scale-[0.99]"
      : "border hover:opacity-80";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${styles} ${className}`}
      style={
        variant === "solid"
          ? { background: "var(--scene-accent)", boxShadow: "0 12px 40px -14px var(--scene-accent)" }
          : { borderColor: "color-mix(in oklab, var(--scene-fg) 30%, transparent)", color: "var(--scene-fg)" }
      }
    >
      {children}
    </button>
  );
}
