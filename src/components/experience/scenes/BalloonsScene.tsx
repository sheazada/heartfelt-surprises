import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SceneShell, SceneButton } from "../SceneShell";
import type { ExperienceReason } from "@/lib/birthday/types";

export function BalloonsScene({
  reasons,
  onNext,
}: {
  reasons: ExperienceReason[];
  onNext: () => void;
}) {
  const [popped, setPopped] = useState<string[]>([]);
  const [active, setActive] = useState<ExperienceReason | null>(null);
  const allPopped = popped.length >= reasons.length;

  const pop = (reason: ExperienceReason) => {
    setPopped((prev) => (prev.includes(reason.id) ? prev : [...prev, reason.id]));
    setActive(reason);
  };

  return (
    <SceneShell>
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-display text-3xl sm:text-4xl" style={{ color: "var(--scene-fg)" }}>
          Reasons you're loved
        </h2>
        <p className="mt-3 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--scene-soft)" }}>
          {popped.length} of {reasons.length} revealed
        </p>

        <div className="mt-10 flex flex-wrap items-end justify-center gap-x-5 gap-y-7">
          {reasons.map((reason, i) => {
            const isPopped = popped.includes(reason.id);
            return (
              <motion.button
                key={reason.id}
                type="button"
                onClick={() => pop(reason)}
                disabled={isPopped}
                aria-label={isPopped ? `Reason ${i + 1}, revealed` : `Pop balloon ${i + 1}`}
                animate={isPopped ? { opacity: 0.25, scale: 0.8 } : { y: [0, -10, 0] }}
                transition={
                  isPopped
                    ? { duration: 0.4 }
                    : { duration: 4 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }
                }
                className="group relative flex flex-col items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--scene-accent)] disabled:cursor-default"
              >
                <span
                  className="block h-14 w-11 rounded-[50%_50%_48%_48%/60%_60%_40%_40%] transition-transform duration-300 group-enabled:group-hover:scale-105 sm:h-16 sm:w-12"
                  style={{
                    background:
                      i % 2 === 0
                        ? "color-mix(in oklab, var(--scene-accent) 72%, var(--scene-bg))"
                        : "color-mix(in oklab, var(--scene-soft) 62%, var(--scene-bg))",
                    boxShadow: "inset -6px -8px 14px rgba(0,0,0,0.22)",
                  }}
                />
                <span
                  className="block h-8 w-px"
                  style={{ background: "color-mix(in oklab, var(--scene-fg) 35%, transparent)" }}
                />
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {active ? (
            <motion.blockquote
              key={active.id}
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
              className="text-display mx-auto mt-12 max-w-md text-xl leading-relaxed sm:text-2xl"
              style={{ color: "var(--scene-fg)" }}
              aria-live="polite"
            >
              “{active.text}”
            </motion.blockquote>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-12 text-sm"
              style={{ color: "color-mix(in oklab, var(--scene-fg) 62%, transparent)" }}
            >
              Tap a balloon to reveal a reason.
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-12">
          <SceneButton onClick={onNext} variant={allPopped ? "solid" : "ghost"}>
            {allPopped ? "Continue" : "Skip ahead"}
          </SceneButton>
        </div>
      </div>
    </SceneShell>
  );
}
