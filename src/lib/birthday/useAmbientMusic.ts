import { useCallback, useEffect, useRef, useState } from "react";
import type { TrackId } from "./types";

/**
 * Built-in ambient tracks are synthesised in the browser with the Web Audio API,
 * so nothing copyrighted is bundled or streamed. Playback can only start from a
 * user gesture, which also satisfies mobile autoplay restrictions.
 */

type Voice = { osc: OscillatorNode; gain: GainNode };

const SCALES: Record<TrackId, number[]> = {
  aurora: [220, 261.63, 329.63, 392, 440],
  musicbox: [523.25, 587.33, 659.25, 783.99, 880, 1046.5],
  lantern: [174.61, 220, 261.63, 293.66, 349.23],
  birthday: [261.63, 329.63, 392],
  sunrise: [261.63, 329.63, 392, 523.25, 659.25],
  starlight: [659.25, 783.99, 987.77, 1174.66, 1318.51],
};

/** Fixed melodies (0 = rest). "Happy Birthday to You" is public domain. */
const G4 = 392, A4 = 440, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
const MELODIES: Partial<Record<TrackId, number[]>> = {
  birthday: [G4, G4, A4, 0, G4, 0, C5, 0, B4, 0, 0, 0, G4, G4, A4, 0, G4, 0, D5, 0, C5, 0, 0, 0,
    G4, G4, G5, 0, E5, 0, C5, 0, B4, 0, A4, 0, F5, F5, E5, 0, C5, 0, D5, 0, C5, 0, 0, 0, 0, 0, 0, 0],
  sunrise: [C5, E5, G5, E5, D5, G4, B4, D5, A4, C5, E5, C5, F5, A4, C5, 0, G4, B4, D5, G5, E5, C5, G4, 0],
};

const TIMBRE: Record<TrackId, OscillatorType> = {
  aurora: "sine",
  musicbox: "triangle",
  lantern: "sine",
  birthday: "triangle",
  sunrise: "triangle",
  starlight: "sine",
};

const INTERVAL_MS: Record<TrackId, number> = {
  aurora: 3800,
  musicbox: 1400,
  lantern: 2400,
  birthday: 300,
  sunrise: 260,
  starlight: 900,
};

const VOLUME = 0.42;

export function useAmbientMusic(track: TrackId, enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const padRef = useRef<Voice[]>([]);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    padRef.current.forEach(({ osc, gain }) => {
      try {
        gain.gain.setTargetAtTime(0, gain.context.currentTime, 0.3);
        osc.stop(gain.context.currentTime + 1.2);
      } catch {
        /* already stopped */
      }
    });
    padRef.current = [];
    setPlaying(false);
  }, []);

  const start = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    const AudioCtor = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AudioCtor) return;

    if (!ctxRef.current) {
      const ctx: AudioContext = new AudioCtor();
      const master = ctx.createGain();
      master.gain.value = 0.0001;
      // Compressor keeps the louder mix from clipping on phone speakers.
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      master.connect(comp).connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    const ctx = ctxRef.current!;
    const master = masterRef.current!;
    void ctx.resume();
    master.gain.setTargetAtTime(muted ? 0 : VOLUME, ctx.currentTime, 0.6);

    if (timerRef.current) return; // already running

    const scale = SCALES[track];
    const type = TIMBRE[track];

    // Sustained pad
    [scale[0]!, scale[2]!].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq / 2;
      gain.gain.value = 0;
      gain.gain.setTargetAtTime((melody ? 0.07 : 0.14) - i * 0.03, ctx.currentTime, 1.5);
      osc.connect(gain).connect(master);
      osc.start();
      padRef.current.push({ osc, gain });
    });

    const melody = MELODIES[track];
    let stepIndex = 0;
    const pluck = () => {
      const now = ctx.currentTime;
      let freq: number;
      if (melody) {
        freq = melody[stepIndex % melody.length]!;
        stepIndex++;
        if (!freq) return;
      } else {
        freq = scale[Math.floor(Math.random() * scale.length)]!;
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(melody ? 0.3 : 0.35, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (melody ? 0.9 : 2.6));
      osc.connect(gain).connect(master);
      osc.start(now);
      osc.stop(now + 2.8);
    };

    pluck();
    timerRef.current = setInterval(pluck, INTERVAL_MS[track]);
    setPlaying(true);
  }, [enabled, muted, track]);

  const pause = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (ctx && master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    stop();
  }, [stop]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (ctx && master) master.gain.setTargetAtTime(next ? 0 : VOLUME, ctx.currentTime, 0.2);
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      stop();
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, [stop]);

  return { playing, muted, start, pause, toggleMute };
}
