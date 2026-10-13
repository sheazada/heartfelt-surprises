import { motion } from "motion/react";
import { SceneShell, SceneButton } from "../SceneShell";
import { Confetti } from "../Confetti";

export function FinaleScene({ name, sender, onReplay }: { name: string; sender: string; onReplay: () => void }) {
  return (
    <SceneShell>
      <Confetti active />
      <div className="relative z-50 w-full max-w-lg text-center">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.6 }}
          className="text-display glow-accent text-5xl leading-tight sm:text-6xl"
          style={{ color: "var(--scene-fg)" }}
        >
          Happy Birthday, {name} ❤️
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-6 text-sm" style={{ color: "var(--scene-soft)" }}>
          With love, {sender}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} className="mt-12 flex flex-col items-center gap-3">
          <SceneButton onClick={onReplay}>Replay the Surprise</SceneButton>
          <a href="/" className="text-xs underline-offset-4 hover:underline" style={{ color: "color-mix(in oklab, var(--scene-fg) 60%, transparent)" }}>
            Make one for someone you love
          </a>
        </motion.div>
      </div>
    </SceneShell>
  );
}
