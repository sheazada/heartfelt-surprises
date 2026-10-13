import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Particles } from "@/components/experience/Particles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wishlight — Create a Birthday Surprise They'll Remember" },
      { name: "description", content: "Make a free, cinematic birthday surprise with photos, reasons you love them, and a heartfelt letter. Share it with one link." },
      { property: "og:title", content: "Wishlight — Create a Birthday Surprise" },
      { property: "og:description", content: "A free, cinematic birthday surprise page with your photos, reasons and letter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  ["Write", "Their name, a few reasons you love them, and a letter from the heart."],
  ["Add memories", "Up to ten photos, each with a caption and a little story."],
  ["Share one link", "They open it and step into a quiet, cinematic surprise."],
];

function Landing() {
  return (
    <main className="theme-romantic scene-surface relative min-h-[100svh] overflow-x-hidden">
      <Particles />
      <section className="relative z-10 mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-6 text-center safe-t">
        <p className="text-xs uppercase tracking-[0.4em]" style={{ color: "var(--scene-soft)" }}>Wishlight</p>
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.4 }}
          className="text-display mt-6 text-5xl leading-[1.05] sm:text-7xl"
          style={{ color: "var(--scene-fg)" }}
        >
          Create a Birthday Surprise They'll Remember ❤️
        </motion.h1>
        <p className="mt-6 max-w-md text-base" style={{ color: "color-mix(in oklab, var(--scene-fg) 70%, transparent)" }}>
          Candles to blow out, balloons hiding reasons, photographs and a handwritten letter — all in one link. Free.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to="/create" className="inline-flex min-h-11 items-center justify-center rounded-full px-7 text-sm font-medium" style={{ background: "var(--scene-accent)", color: "var(--scene-bg)" }}>
            Create a Surprise
          </Link>
          <a href="#how" className="inline-flex min-h-11 items-center justify-center rounded-full border px-7 text-sm" style={{ borderColor: "color-mix(in oklab, var(--scene-fg) 30%, transparent)", color: "var(--scene-fg)" }}>
            See How It Works
          </a>
        </div>
      </section>
      <section id="how" className="relative z-10 mx-auto max-w-4xl px-6 pb-28 safe-b">
        <div className="grid gap-10 sm:grid-cols-3">
          {STEPS.map(([t, d], i) => (
            <div key={t} className="border-t pt-6" style={{ borderColor: "color-mix(in oklab, var(--scene-fg) 18%, transparent)" }}>
              <span className="text-display text-3xl" style={{ color: "var(--scene-accent)" }}>0{i + 1}</span>
              <h2 className="text-display mt-2 text-2xl" style={{ color: "var(--scene-fg)" }}>{t}</h2>
              <p className="mt-2 text-sm" style={{ color: "color-mix(in oklab, var(--scene-fg) 65%, transparent)" }}>{d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
