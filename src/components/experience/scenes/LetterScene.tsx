import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SceneShell, SceneButton } from "../SceneShell";

export function LetterScene({ letter, sender, onNext }: { letter: string; sender: string; onNext: () => void }) {
  const [open, setOpen] = useState(false);
  const paragraphs = letter.split(/\n+/).filter((p) => p.trim());

  return (
    <SceneShell>
      <div className="w-full max-w-lg text-center">
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.div key="env" exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center gap-10">
              <p className="text-display text-2xl sm:text-3xl" style={{ color: "var(--scene-fg)" }}>
                There's one more thing…
              </p>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open the letter"
                className="relative h-40 w-60 rounded-md transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--scene-accent)]"
                style={{ background: "color-mix(in oklab, var(--scene-fg) 88%, var(--scene-accent))" }}
              >
                <span
                  className="absolute inset-x-0 top-0 h-24"
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "color-mix(in oklab, var(--scene-fg) 70%, var(--scene-accent))" }}
                />
                <span className="absolute left-1/2 top-[5.2rem] size-7 -translate-x-1/2 rounded-full" style={{ background: "var(--scene-accent)" }} />
              </button>
              <span className="text-xs uppercase tracking-[0.35em]" style={{ color: "var(--scene-soft)" }}>Tap to open</span>
            </motion.div>
          ) : (
            <motion.article
              key="letter"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9 }}
              className="max-h-[72svh] overflow-y-auto rounded-sm px-6 py-8 text-left shadow-2xl sm:px-10"
              style={{ background: "var(--scene-fg)", color: "var(--scene-bg)" }}
            >
              {paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ delay: 0.6 + i * 0.9, duration: 1.2 }}
                  className="text-hand mb-4 whitespace-pre-line text-2xl leading-snug"
                >
                  {p}
                </motion.p>
              ))}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + paragraphs.length * 0.9 }}
                className="text-hand mt-6 text-right text-2xl"
              >
                — {sender}
              </motion.p>
            </motion.article>
          )}
        </AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 + paragraphs.length * 0.9 }} className="mt-8">
            <SceneButton onClick={onNext}>One last thing</SceneButton>
          </motion.div>
        ) : null}
      </div>
    </SceneShell>
  );
}
