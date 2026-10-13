import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import type { ExperienceData } from "@/lib/birthday/types";
import { useAmbientMusic } from "@/lib/birthday/useAmbientMusic";
import { Particles } from "./Particles";
import { MusicControl } from "./MusicControl";
import { OpeningScene } from "./scenes/OpeningScene";
import { RevealScene } from "./scenes/RevealScene";
import { CakeScene } from "./scenes/CakeScene";
import { BalloonsScene } from "./scenes/BalloonsScene";
import { MemoriesScene } from "./scenes/MemoriesScene";
import { LetterScene } from "./scenes/LetterScene";
import { FinaleScene } from "./scenes/FinaleScene";

type Scene = "opening" | "reveal" | "cake" | "balloons" | "memories" | "letter" | "finale";

export function BirthdayExperience({ data }: { data: ExperienceData }) {
  const scenes = useMemo<Scene[]>(() => {
    const list: Scene[] = ["opening", "reveal", "cake"];
    if (data.reasons.length) list.push("balloons");
    if (data.photos.length) list.push("memories");
    if (data.letter.trim()) list.push("letter");
    list.push("finale");
    return list;
  }, [data]);

  const [step, setStep] = useState(0);
  const [round, setRound] = useState(0);
  const music = useAmbientMusic(data.musicTrack, data.musicEnabled);
  const scene = scenes[step] ?? "finale";
  const next = () => {
    setStep((s) => Math.min(s + 1, scenes.length - 1));
    window.scrollTo({ top: 0 });
  };

  return (
    <div className={`theme-${data.theme} scene-surface relative min-h-[100svh] w-full overflow-x-hidden`}>
      <Particles variant={data.theme === "celebration" ? "embers" : "stars"} />
      {data.musicEnabled && step > 0 ? (
        <MusicControl playing={music.playing} muted={music.muted} onPlay={music.start} onPause={music.pause} onToggleMute={music.toggleMute} />
      ) : null}
      <AnimatePresence mode="wait">
        <div key={`${scene}-${round}`}>
          {scene === "opening" && (
            <OpeningScene
              onBegin={() => {
                if (data.musicEnabled) music.start();
                next();
              }}
            />
          )}
          {scene === "reveal" && <RevealScene name={data.recipientName} introMessage={data.introMessage} age={data.age} onNext={next} />}
          {scene === "cake" && <CakeScene name={data.recipientName} onNext={next} />}
          {scene === "balloons" && <BalloonsScene reasons={data.reasons} onNext={next} />}
          {scene === "memories" && <MemoriesScene photos={data.photos} onNext={next} />}
          {scene === "letter" && <LetterScene letter={data.letter} sender={data.senderName} onNext={next} />}
          {scene === "finale" && (
            <FinaleScene
              name={data.recipientName}
              sender={data.senderName}
              onReplay={() => {
                setRound((r) => r + 1);
                setStep(1);
              }}
            />
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
