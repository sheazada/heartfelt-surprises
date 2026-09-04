import { useMemo } from "react";

type Props = { count?: number; variant?: "stars" | "embers" };

/** Lightweight CSS-transform particles — no canvas, no per-frame React work. */
export function Particles({ count = 26, variant = "stars" }: Props) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 37.5) % 100,
        top: (i * 53.7) % 100,
        size: variant === "stars" ? 1.5 + ((i * 7) % 3) : 3 + ((i * 5) % 4),
        delay: (i % 9) * 0.7,
        duration: 5 + ((i * 3) % 7),
      })),
    [count, variant],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <span
          key={d.id}
          className={variant === "stars" ? "absolute rounded-full animate-twinkle" : "absolute rounded-full animate-drift"}
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: "var(--scene-soft)",
            opacity: variant === "stars" ? 0.4 : 0.25,
            filter: variant === "embers" ? "blur(1px)" : undefined,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
