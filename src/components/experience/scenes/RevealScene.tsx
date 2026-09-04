import { motion } from "motion/react";
import { SceneShell, SceneButton } from "../SceneShell";

export function RevealScene({
  name,
  introMessage,
  age,
  onNext,
}: {
  name: string;
  introMessage: string;
  age: number | null;
  onNext: () => void;
}) {
  const words = `Happy Birthday, ${name}`.split(" ");

  return (
    <SceneShell>
      <div className="w-full max-w-xl text-center">
        <h1 className="text-display text-4xl leading-tight sm:text-6xl" style={{ color: "var(--scene-fg)" }}>
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.25 + i * 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="mr-[0.3em] inline-block"
              style={{ color: i === words.length - 1 ? "var(--scene-accent)" : "inherit" }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {age ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="mt-4 text-xs uppercase tracking-[0.4em]"
            style={{ color: "var(--scene-soft)" }}
          >
            {age} years of you
          </motion.p>
        ) : null}

        {introMessage ? (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 1.1 }}
            className="mx-auto mt-8 max-w-md text-base leading-relaxed sm:text-lg"
            style={{ color: "color-mix(in oklab, var(--scene-fg) 82%, transparent)" }}
          >
            {introMessage}
          </motion.p>
        ) : null}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="mt-12"
        >
          <SceneButton onClick={onNext}>Continue</SceneButton>
        </motion.div>
      </div>
    </SceneShell>
  );
}
