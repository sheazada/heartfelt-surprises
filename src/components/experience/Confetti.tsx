import { motion } from "motion/react";
import { useMemo } from "react";

type Props = { pieces?: number; active: boolean };

export function Confetti({ pieces = 40, active }: Props) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: (i * 17.3) % 100,
        delay: (i % 12) * 0.12,
        duration: 2.6 + ((i * 7) % 20) / 10,
        rotate: (i * 47) % 360,
        width: 5 + (i % 4),
        height: 9 + (i % 6),
        color: i % 3 === 0 ? "var(--scene-accent)" : i % 3 === 1 ? "var(--scene-soft)" : "var(--scene-fg)",
      })),
    [pieces],
  );

  if (!active) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {items.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: "-10vh", opacity: 0, rotate: 0 }}
          animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn", repeat: Infinity, repeatDelay: 1.6 }}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            borderRadius: 2,
            background: p.color,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}
