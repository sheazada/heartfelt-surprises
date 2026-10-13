import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { SceneShell, SceneButton } from "../SceneShell";
import type { ExperiencePhoto } from "@/lib/birthday/types";

export function MemoriesScene({ photos, onNext }: { photos: ExperiencePhoto[]; onNext: () => void }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const total = photos.length;
  const go = (d: number) => {
    setDir(d);
    setIndex((i) => (i + d + total) % total);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Preload the next image for smooth swiping.
  useEffect(() => {
    const next = photos[(index + 1) % total];
    if (next) new Image().src = next.url;
  }, [index, photos, total]);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <SceneShell>
      <div className="w-full max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.35em]" style={{ color: "var(--scene-soft)" }}>
          Memories · {index + 1} of {total}
        </p>

        <div className="relative mx-auto mt-8 h-[min(30rem,64svh)] w-[min(20rem,80vw)]">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.figure
              key={photo.id}
              custom={dir}
              initial={{ opacity: 0, x: dir * 80, rotate: dir * 6 }}
              animate={{ opacity: 1, x: 0, rotate: index % 2 ? 1.5 : -1.5 }}
              exit={{ opacity: 0, x: dir * -80, rotate: dir * -6 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                else if (info.offset.x > 60) go(-1);
              }}
              className="absolute inset-0 flex cursor-grab flex-col rounded-sm p-3 pb-4 shadow-2xl active:cursor-grabbing"
              style={{ background: "var(--scene-fg)", color: "var(--scene-bg)" }}
            >
              <img
                src={photo.url}
                alt={photo.caption ?? `Memory ${index + 1}`}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="min-h-0 w-full flex-1 rounded-[2px] object-cover"
              />
              {photo.caption ? <figcaption className="text-hand mt-3 text-2xl leading-tight">{photo.caption}</figcaption> : null}
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-6 min-h-12">
          {photo.memory ? (
            <p className="text-display text-lg italic leading-snug" style={{ color: "var(--scene-fg)" }}>
              “{photo.memory}”
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          {total > 1 ? (
            <>
              <button type="button" aria-label="Previous memory" onClick={() => go(-1)} className="flex size-11 items-center justify-center rounded-full border" style={{ borderColor: "color-mix(in oklab, var(--scene-fg) 30%, transparent)", color: "var(--scene-fg)" }}>
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" aria-label="Next memory" onClick={() => go(1)} className="flex size-11 items-center justify-center rounded-full border" style={{ borderColor: "color-mix(in oklab, var(--scene-fg) 30%, transparent)", color: "var(--scene-fg)" }}>
                <ChevronRight className="size-5" />
              </button>
            </>
          ) : null}
        </div>
        <div className="mt-8">
          <SceneButton onClick={onNext}>Continue</SceneButton>
        </div>
      </div>
    </SceneShell>
  );
}
