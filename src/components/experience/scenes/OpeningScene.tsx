import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { SceneShell } from "../SceneShell";

export function OpeningScene({ onBegin }: { onBegin: () => void }) {
  return (
    <SceneShell>
      <button
        type="button"
        onClick={onBegin}
        className="group flex w-full max-w-md flex-col items-center gap-10 rounded-3xl px-2 py-6 text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--scene-accent)]"
        aria-label="Tap to begin the birthday surprise"
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.3 }}
          className="text-display text-2xl leading-snug sm:text-3xl"
          style={{ color: "var(--scene-fg)" }}
        >
          Someone made something special for you…
        </motion.p>

        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="relative flex size-24 items-center justify-center rounded-full"
          style={{ background: "color-mix(in oklab, var(--scene-accent) 18%, transparent)" }}
        >
          <motion.span
            animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ background: "var(--scene-accent)" }}
          />
          <Heart className="relative size-8" style={{ color: "var(--scene-accent)" }} />
        </motion.span>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 3, delay: 2.2, repeat: Infinity }}
          className="text-xs uppercase tracking-[0.35em]"
          style={{ color: "var(--scene-soft)" }}
        >
          Tap to begin
        </motion.span>
      </button>
    </SceneShell>
  );
}
