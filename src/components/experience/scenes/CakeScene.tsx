import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { SceneShell, SceneButton } from "../SceneShell";

function Candle({ lit, index, onBlow }: { lit: boolean; index: number; onBlow: () => void }) {
  return (
    <button
      type="button"
      onClick={onBlow}
      aria-label={lit ? `Blow out candle ${index + 1}` : `Candle ${index + 1} is out`}
      className="relative flex flex-col items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--scene-accent)]"
    >
      <AnimatePresence>
        {lit ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.2, y: -10 }}
            className="mb-1 block size-2.5 rounded-full animate-flicker"
            style={{
              background: "var(--scene-accent)",
              boxShadow: "0 0 18px 6px color-mix(in oklab, var(--scene-accent) 55%, transparent)",
            }}
          />
        ) : (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5, y: -8 }}
            className="mb-1 block h-2.5 w-px"
            style={{ background: "color-mix(in oklab, var(--scene-fg) 40%, transparent)" }}
          />
        )}
      </AnimatePresence>
      <span
        className="block h-7 w-1.5 rounded-sm"
        style={{ background: "color-mix(in oklab, var(--scene-fg) 78%, transparent)" }}
      />
    </button>
  );
}

export function CakeScene({ name, onNext }: { name: string; onNext: () => void }) {
  const [lit, setLit] = useState([true, true, true, true, true]);
  const allOut = lit.every((l) => !l);

  const blow = (index: number) =>
    setLit((prev) => prev.map((value, i) => (i === index ? false : value)));

  return (
    <SceneShell>
      <div className="w-full max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.35em]" style={{ color: "var(--scene-soft)" }}>
          {allOut ? "Wish made" : "Tap the candles"}
        </p>

        <motion.div
          animate={allOut ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.8 }}
          className="relative mx-auto mt-10 w-[min(20rem,84vw)]"
        >
          <div className="flex items-end justify-center gap-4">
            {lit.map((isLit, i) => (
              <Candle key={i} index={i} lit={isLit} onBlow={() => blow(i)} />
            ))}
          </div>

          {/* Cake */}
          <div className="mt-2">
            <div
              className="mx-auto h-12 w-full rounded-t-xl"
              style={{ background: "color-mix(in oklab, var(--scene-accent) 45%, var(--scene-bg-2))" }}
            />
            <div
              className="mx-auto h-16 w-full rounded-b-2xl"
              style={{ background: "color-mix(in oklab, var(--scene-soft) 32%, var(--scene-bg-2))" }}
            />
            <div
              className="mx-auto mt-1 h-1.5 w-[110%] max-w-none -translate-x-[5%] rounded-full opacity-40"
              style={{ background: "var(--scene-bg-2)" }}
            />
          </div>

          <AnimatePresence>
            {allOut ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1.6 }}
                transition={{ duration: 1.4 }}
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, color-mix(in oklab, var(--scene-accent) 30%, transparent), transparent)",
                }}
              />
            ) : null}
          </AnimatePresence>
        </motion.div>

        <div className="mt-12 min-h-24">
          <AnimatePresence mode="wait">
            {allOut ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <p className="text-display text-2xl" style={{ color: "var(--scene-fg)" }}>
                  Make a wish, {name}.
                </p>
                <SceneButton onClick={onNext}>Continue</SceneButton>
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
                style={{ color: "color-mix(in oklab, var(--scene-fg) 65%, transparent)" }}
              >
                No microphone needed — just tap each flame.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SceneShell>
  );
}
