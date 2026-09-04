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
};

const TIMBRE: Record<TrackId, OscillatorType> = {
  aurora: "sine",
  musicbox: "triangle",
  lantern: "sine",
};

const INTERVAL_MS: Record<TrackId, number> = {
  aurora: 3800,
  musicbox: 1400,
  lantern: 2400,
};

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
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    const ctx = ctxRef.current!;
    const master = masterRef.current!;
    void ctx.resume();
    master.gain.setTargetAtTime(muted ? 0 : 0.16, ctx.currentTime, 0.6);

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
      gain.gain.setTargetAtTime(0.09 - i * 0.03, ctx.currentTime, 1.5);
      osc.connect(gain).connect(master);
      osc.start();
      padRef.current.push({ osc, gain });
    });

    const pluck = () => {
      const now = ctx.currentTime;
      const freq = scale[Math.floor(Math.random() * scale.length)]!;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
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
      if (ctx && master) master.gain.setTargetAtTime(next ? 0 : 0.16, ctx.currentTime, 0.2);
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
